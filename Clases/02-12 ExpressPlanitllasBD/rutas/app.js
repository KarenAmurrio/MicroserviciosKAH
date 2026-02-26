const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h2>Hola desde Express! TERRY</h2>');
});

app.post('/usuarios', (req, res) => {
  const { nombre, edad } = req.body;
  res.send(`Usuario creado: ${nombre} (${edad})`);
});

const port = 3000;

app.listen(port, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
