const fs = require('fs');

const data = 'Hola, este es un ejemplo de escritura en un archivo usando Node.js.';

fs.writeFile('ejemplo.txt', data, (err) => {
    if (err) throw err;
    console.log('El archivo ha sido guardado exitosamente.');
});