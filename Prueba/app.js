// Carga las variables de entorno desde el archivo .env
require('dotenv').config(); 

const Server = require('./lib/server');

const server = new Server();
 
server.listen();