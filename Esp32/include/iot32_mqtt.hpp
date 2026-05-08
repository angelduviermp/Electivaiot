#pragma once
#include "iot32_functions.hpp"
#include "iot32_header.hpp"
#include <PubSubClient.h>
#include <WiFi.h>

WiFiClient espClient;
PubSubClient mqttClient(espClient);

char topic[150];
String mqtt_data = "";
long lastMqttReconnectAttempt = 0;
long lastMsg = 0;

void callback(char *topic, byte *payload, unsigned int length);
String Json();

char willTopic[150];
bool willQoS = 0;
bool willRetain = false;
String willMessage = "{\"connected\": false}";
bool cleanSession = true;

// -------------------------------------------------------------------
// MQTT Connect
// -------------------------------------------------------------------
boolean mqtt_connect() {
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);
  log("[ INFO ] Intentando conexión al Broker MQTT...");

  String topic_publish = String(mqtt_topic_publish);
  topic_publish.toCharArray(willTopic, 150);

  const char *client_id = mqtt_cloud_id;

  boolean connected = false;

  if (strlen(mqtt_user) > 0) {
    connected = mqttClient.connect(client_id, mqtt_user, mqtt_password,
                                   willTopic, willQoS, willRetain,
                                   willMessage.c_str(), cleanSession);
  } else {
    connected =
        mqttClient.connect(client_id, NULL, NULL, willTopic, willQoS,
                           willRetain, willMessage.c_str(), cleanSession);
  }

  if (connected) {
    log("[ INFO ] Conectado al Broker MQTT");
    String topic_subscribe = String(mqtt_topic_subscribe);
    topic_subscribe.toCharArray(topic, 150);

    if (mqttClient.subscribe(topic, mqtt_qos)) {
      log("[ INFO ] Suscrito: " + String(topic));
    } else {
      log("[ ERROR ] Failed, to suscribe!");
    }
    if (mqtt_status_send) {
      mqttClient.publish(willTopic, "{\"connected\": true}", mqtt_retain);
    }
  } else {
    log(String("[ ERROR ] Fallo conexión MQTT, rc= ") +
        String(mqttClient.state()));
    return (0);
  }
  return (1);
}

// -------------------------------------------------------------------
// Manejo de los Mensajes Entrantes
// -------------------------------------------------------------------
void callback(char *topic, byte *payload, unsigned int length) {
  String str_topic(topic);
  String mensaje((char *)payload, length);
  mensaje.trim();

  mqttRX();
  log("[ INFO ] Topico -->" + str_topic);
  log("[ INFO ] Mensaje -->" + mensaje);
}

// -------------------------------------------------------------------
// Manejo de los Mensajes Salientes
// -------------------------------------------------------------------
void mqtt_publish() {
  String topic = String(mqtt_topic_publish);

  if (strlen(mqtt_custom_message) > 0) {
    mqtt_data = String(mqtt_custom_message);
  } else {
    mqtt_data = Json();
  }

  mqttClient.publish(topic.c_str(), mqtt_data.c_str(), mqtt_retain);
  mqtt_data = "";
  mqttTX();
}

// -------------------------------------------------------------------
// JSON con información del Dispositivo para envio por MQTT
// -------------------------------------------------------------------
String Json() {
  String response;
  // Aumentamos un poco la capacidad por si acaso
  DynamicJsonDocument jsonDoc(1024);

  // ID único del dispositivo
  jsonDoc["dispositivo_uuid"] = String(mqtt_cloud_id);

  // Leer el valor del sensor en GPIO 3
  // Si es un sensor de variación (0-4095):
  int lectura = analogRead(3);

  // Si quieres enviarlo como "valor" para que coincida con tu API:
  jsonDoc["valor"] = lectura;

  // Añadimos un timestamp o estado para debug
  jsonDoc["status"] = "activo";

  serializeJson(jsonDoc, response);
  return response;
}

// -------------------------------------------------------------------
// MQTT Loop Principal
// -------------------------------------------------------------------
void mqttLoop() {
  if (mqtt_cloud_enable) {
    if (!mqttClient.connected()) {
      long now = millis();
      if ((now < 10000) || ((now - lastMqttReconnectAttempt) > 10000)) {
        lastMqttReconnectAttempt = now;
        if (mqtt_connect()) {
          lastMqttReconnectAttempt = 0;
        }
        setOnSingle(MQTTLED);
      }
    } else {
      mqttClient.loop();
      setOffSingle(MQTTLED);
    }
  }
}
