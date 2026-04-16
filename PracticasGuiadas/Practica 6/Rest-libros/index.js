const express = require('express');
const conectarDB = require('./db');

const app = express();


app.use(express.json());


conectarDB();


app.use('/libro', require('./routes/routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));