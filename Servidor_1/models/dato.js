const { Schema, model } = require('mongoose');

const DatoSchema = Schema({
    dispositivo_uuid: {
        type: String,
        required: [true, 'El UUID del dispositivo es obligatorio'],
        ref: 'Dispositivo' // Opcional: permite usar populate si se busca por uuid manualmente
    },
    valor: {
        type: Number,
        required: [true, 'El valor del sensor es obligatorio']
    },
    fecha_insercion: {
        type: Date,
        default: Date.now
    }
});

// Limpiar la respuesta JSON
DatoSchema.methods.toJSON = function() {
    const { __v, _id, ...dato } = this.toObject();
    return dato;
}

module.exports = model('Dato', DatoSchema);
