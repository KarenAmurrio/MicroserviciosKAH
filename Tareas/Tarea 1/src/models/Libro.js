const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
});

module.exports = mongoose.model('Libro', libroSchema);
