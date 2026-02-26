const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send(`
    <h2>Calculadora</h2><br>
    <form action="/calcular" method="post">
        <label for="num1">Número 1:</label><br>
        <input type="number" id="num1" name="num1" placeholder="Número 1" required><br><br>
        <label for="num2">Número 2:</label><br>
        <input type="number" id="num2" name="num2" placeholder="Número 2" required><br><br>
        <button type="submit">Calcular</button>
    </form>
  `);
});

app.post('/calcular', (req, res) => {
    const num1 = parseInt(req.body.num1);
    const num2 = parseInt(req.body.num2);
    const resultado = num1+ num2;
    res.send(`El resultado de ${num1} + ${num2} es: ${resultado}`);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});