const mqtt = require('mqtt');
const axios = require('axios');

/**
 * Cliente MQTT para recibir datos del ESP32 y enviarlos a la API principal.
 */
class MqttClient {

    constructor() {
        this.broker = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
        this.topic = process.env.MQTT_TOPIC || 'Plc/Esp32';
        this.apiUrl = process.env.API_URL || 'http://localhost:3000/api/datos';
        this.user = process.env.MQTT_USER;
        this.pass = process.env.MQTT_PASS;
        this.client = null;
    }

    /**
     * Inicializa la conexión y suscribe al tópico.
     */
    connect() {
        console.log(`Conectando al broker MQTT: ${this.broker}...`);
        
        const options = {};
        if (this.user) options.username = this.user;
        if (this.pass) options.password = this.pass;

        this.client = mqtt.connect(this.broker, options);

        this.client.on('connect', () => {
            console.log('MQTT: Conectado con éxito');
            this.client.subscribe(this.topic, (err) => {
                if (!err) {
                    console.log(`MQTT: Suscrito al tópico: ${this.topic}`);
                } else {
                    console.error('MQTT: Error al suscribirse:', err);
                }
            });
        });

        this.client.on('message', (topic, message) => {
            // message is Buffer
            const payload = message.toString();
            console.log(`MQTT: Mensaje recibido en [${topic}]: ${payload}`);
            
            this.processMessage(payload);
        });

        this.client.on('error', (err) => {
            console.error('MQTT: Error en la conexión:', err);
        });
    }

    /**
     * Procesa el mensaje recibido y lo envía a Servidor_0.
     * @param {string} payload - JSON string recibido del ESP32.
     */
    async processMessage(payload) {
        try {
            const data = JSON.parse(payload);
            
            // Validar que el objeto tenga lo necesario (dispositivo_uuid y valor)
            if (!data.dispositivo_uuid || data.valor === undefined) {
                console.warn('MQTT: El mensaje recibido no tiene el formato correcto {dispositivo_uuid, valor}');
                return;
            }

            console.log(`MQTT: Reenviando dato a la API: ${this.apiUrl}...`);
            
            const resp = await axios.post(this.apiUrl, data);
            
            console.log('API Response:', resp.data);

        } catch (error) {
            console.error('Error al procesar mensaje MQTT o reenviar a API:', error.message);
            if (error.response) {
                console.error('Detalle del error de la API:', error.response.data);
            }
        }
    }
}

module.exports = new MqttClient();
