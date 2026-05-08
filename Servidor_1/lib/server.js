const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const { dbConnection } = require('../database/config');
const mqttClient = require('./mqtt-client');

/**
 * Clase que representa el servidor de la aplicación.
 * Configura los middlewares, las rutas y el puerto de escucha.
 */
class Server {

    constructor() {
        /**
         * Aplicación de Express.
         * @type {express.Application}
         */
        this.app  = express();

        /**
         * Servidor HTTP de Node para integrar Socket.io.
         */
        this.server = http.createServer(this.app);

        /**
         * Instancia de Socket.io.
         */
        this.io = socketio(this.server, {
            cors: {
                origin: "*", // En producción, ajustar al dominio del frontend
                methods: ["GET", "POST"]
            }
        });

        /**
         * Puerto en el que correrá el servidor. Usa fallback 3000 si no está definida.
         * @type {string|number}
         */
        this.port = process.env.PORT || 3000;

        // Conectar a la base de datos (si la hay)
        this.conectarDB();

        // Inicializar el cliente MQTT
        this.conectarMQTT();

        /**
         * Ruta base para las APIs relacionadas con dispositivos.
         * @type {string}
         */
        this.dispositivosPath = '/api/dispositivos';
        this.datosPath        = '/api/datos';

        // Middlewares: Funciones que añaden funcionalidad al web server
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        // Configuración de Sockets
        this.sockets();
    }

    /**
     * Inicializa la conexión a la base de datos.
     */
    async conectarDB() {
        await dbConnection();
    }

    /**
     * Inicializa el cliente MQTT para recibir datos del ESP32.
     */
    conectarMQTT() {
        mqttClient.connect();
    }

    /**
     * Define y configura los middlewares globales de la aplicación.
     */
    middlewares() {

        // CORS: Habilita el Intercambio de Recursos de Origen Cruzado
        this.app.use( cors() );

        // Lectura y parseo del body: Permite leer JSON en las peticiones
        this.app.use( express.json() );

        // Directorio Público: Define la carpeta para archivos estáticos
        this.app.use( express.static('public') );

        // Inyectar IO en las peticiones para que los controladores puedan usarlo
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });

    }

    /**
     * Define las rutas de la aplicación vinculando los endpoints con sus archivos de rutas.
     */
    routes() {
        this.app.use( this.dispositivosPath, require('../routes/dispositivos'));
        this.app.use( this.datosPath,        require('../routes/datos'));
    }

    /**
     * Configura los eventos básicos de Socket.io.
     */
    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado vía WebSocket:', socket.id);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    /**
     * Inicia el servidor y lo pone a escuchar en el puerto especificado.
     */
    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}

module.exports = Server;
