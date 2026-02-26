require("reflect-metadata");
const express = require("express");
const AppDataSource = require("./data-source");

AppDataSource.initialize()
  .then(() => {
    console.log(" Conectado a MySQL");
  })
  .catch((error) => {
    console.error(" Error de conexión", error);
  });

const app = express();
app.use(express.json());


app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});
