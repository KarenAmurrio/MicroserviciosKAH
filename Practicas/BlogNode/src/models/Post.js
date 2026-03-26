const mongoose = require('mongoose');

const postEsquema = new mongoose.Schema({

    titulo: { type: String, required: true},
    usuario: { type: String, required: false},
    contenido: { type: String, required: true}

})
module.exports = mongoose.model('Post', postEsquema);