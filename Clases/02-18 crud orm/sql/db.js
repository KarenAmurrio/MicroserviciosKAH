const mysql = require('mysql2');
// Configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',     
  user: 'root',          // Usuario de tu base de datos
  password: '',  // Contraseña de tu base de datos
  database: 'bd_ventas'  // Nombre de la base de datos
});
// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
    console.log('Conexión exitosa a la base de datos');
});
module.exports = connection;
