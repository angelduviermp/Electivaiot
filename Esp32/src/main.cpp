// -------------------------------------------------------------------
// Librerías
// -------------------------------------------------------------------
#include <Arduino.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <SPIFFS.h>
#include <TimeLib.h>

// -------------------------------------------------------------------
// Archivos *.hpp - Fragmentar el Código
// -------------------------------------------------------------------
#include "iot32_functions.hpp"
#include "iot32_header.hpp"
#include "iot32_mqtt.hpp"
#include "iot32_settings.hpp"
#include "iot32_wifi.hpp"

// -------------------------------------------------------------------
// Setup
// -------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  setCpuFrequencyMhz(240);
  // Memoria EEPROM init
  EEPROM.begin(256);
  // Leer el valor de la memoria
  EEPROM.get(Restart_Address, device_restart);
  device_restart++;
  // Guardar el valor a la memoria
  EEPROM.put(Restart_Address, device_restart);
  EEPROM.commit();
  EEPROM.end();
  log("\n[ INFO ] Iniciando Setup");
  log("[ INFO ] MAC: " + WiFi.macAddress());
  log("[ INFO ] Reinicios " + String(device_restart));
  log("[ INFO ] Setup corriendo en el Core " + String(xPortGetCoreID()));
  // Iniciar el SPIFFS
  if (!SPIFFS.begin(true)) {
    log("[ ERROR ] Falló la inicialización del SPIFFS");
    while (true)
      ;
  }
  // Leer el Archivo settings.json
  if (!settingsRead()) {
    settingsSave();
  }
  // Configuración de los LEDs
  settingPines();
  // Setup WIFI
  wifi_setup();

  log("[ INFO ] Setup completado");
  logMemory();
}
// -------------------------------------------------------------------
// Loop Principal
// -------------------------------------------------------------------
void loop() {
  // -----------------------------------------------------------------
  // WIFI
  // -----------------------------------------------------------------
  if (wifi_mode == WIFI_STA) {
    wifiLoop();
  } else if (wifi_mode == WIFI_AP) {
    wifiAPLoop();
  }
  // -----------------------------------------------------------------
  // MQTT
  // -----------------------------------------------------------------
  if (mqtt_cloud_enable) {
    if (mqtt_server[0] != '\0') {
      // Función para el Loop principla de MQTT
      mqttLoop();
      if (mqttClient.connected() && mqtt_time_send) {
        // Funcion para enviar JSON por MQTT
        if (millis() - lastMsg > mqtt_time_interval) {
          lastMsg = millis();
          mqtt_publish();
        }
      }
    }
  }
}