const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        const dbCnn = process.env.MONGODB_CNN || 'mongodb://localhost:27017/electiva';
        await mongoose.connect(dbCnn, {
            // opciones recomendadas por Mongoose
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Base de datos MongoDB conectada:', dbCnn);

    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
        // Salir con código distinto para que un process manager pueda reiniciar
        process.exit(1);
    }
}

module.exports = {
    dbConnection
}