const fs = require('fs');

fs.readFile('ejemplo.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log('Contenido del archivo:');
    console.log(data);
});