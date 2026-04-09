const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    estado: { 
        type: String, 
        enum: ['PLANIFICACION', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'],
        default: 'PLANIFICACION'
    },
    fechaInicio: { type: String, required: true },
    fechaFin: String,
    presupuesto: { type: Number, required: true },
    empleadosIds: [String] // Aquí guardaremos los IDs (1, 2, 3...) que vienen de MySQL
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);