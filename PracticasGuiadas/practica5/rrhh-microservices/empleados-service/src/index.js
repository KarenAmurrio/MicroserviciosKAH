require('dotenv').config();
const express = require('express');
const cors = require('cors');
const empleadosRoutes = require('./routes/empleados');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); // Vital para que el POST reconozca el cuerpo JSON

// Rutas
app.use('/empleados', empleadosRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Servicio de Empleados (REST) corriendo en http://localhost:${PORT}`);
});