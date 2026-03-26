const db = require('../bd');

// Query: Obtener todos los productos
const productos = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM productos', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Query: Obtener un producto por ID con sus movimientos
const producto = ({ id }) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM productos WHERE id = ?', [id], (err, productoResults) => {
            if (err) return reject(err);
            
            const productoData = productoResults[0];
            
            // Si el producto no existe, resolvemos con null para evitar errores al leer .movimientos
            if (!productoData) return resolve(null);

            db.query(
                'SELECT * FROM movimientos WHERE producto_id = ? ORDER BY fecha DESC',
                [id],
                (errMov, movimientos) => { // Cambiado a errMov para evitar confusión
                    if (errMov) return reject(errMov);
                    
                    productoData.movimientos = movimientos;
                    resolve(productoData);
                }
            );
        });
    });
};

// Query: Obtener movimientos de un producto específico
const movimientos = ({ producto_id }) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM movimientos WHERE producto_id = ?', [producto_id], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Query: Obtener todos los proveedores
const proveedores = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM proveedores', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Obtener proveedor por ID
const proveedor = ({ id }) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM proveedores WHERE id = ?', [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};


// Mutation: Registrar un movimiento y actualizar el stock del producto
const registrarMovimiento = ({ input }) => {
    const { producto_id, tipo, cantidad, fecha, observacion } = input;

    return new Promise((resolve, reject) => {
        // 1. Obtener el stock actual y validar que el producto existe
        db.query('SELECT stock_actual, nombre FROM productos WHERE id = ?', [producto_id], (err, results) => {
            if (err) return reject(new Error("Error al consultar el producto"));
            if (results.length === 0) return reject(new Error("Producto no encontrado"));

            const stockActual = results[0].stock_actual;
            let nuevoStock = 0;

            // 2. Calcular nuevo stock según el tipo de movimiento
            if (tipo === 'ENTRADA') {
                nuevoStock = stockActual + cantidad;
            } else if (tipo === 'SALIDA') {
                nuevoStock = stockActual - cantidad;
                
                // 3. Validar: si SALIDA y nuevo_stock < 0 → rechazar
                if (nuevoStock < 0) {
                    return reject(new Error(`Stock insuficiente. Stock actual: ${stockActual}, solicitado: ${cantidad}`));
                }
            } else {
                return reject(new Error("Tipo de movimiento inválido (Debe ser ENTRADA o SALIDA)"));
            }

            // 4. Iniciar la actualización: Insertar en la tabla movimientos
            const queryMovimiento = 'INSERT INTO movimientos (producto_id, tipo, cantidad, fecha, observacion) VALUES (?, ?, ?, ?, ?)';
            db.query(queryMovimiento, [producto_id, tipo, cantidad, fecha, observacion], (errMov, resultMov) => {
                if (errMov) return reject(new Error("Error al registrar el movimiento"));

                const idMovimiento = resultMov.insertId;

                // 5. UPDATE productos SET stock_actual = nuevo_stock
                db.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [nuevoStock, producto_id], (errUpd) => {
                    if (errUpd) return reject(new Error("Error al actualizar el stock del producto"));

                    // 6. Devolver el movimiento creado (con los datos del input + el ID generado)
                    resolve({
                        id: idMovimiento,
                        producto_id,
                        tipo,
                        cantidad,
                        fecha,
                        observacion
                    });
                });
            });
        });
    });
};
// Crear proveedor
const crearProveedor = ({ input }) => {
    const { nombre, telefono, ciudad } = input;
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO proveedores (nombre, telefono, ciudad) VALUES (?, ?, ?)',
            [nombre, telefono, ciudad],
            (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, ...input });
            }
        );
    });
};

// Modificar proveedor
const actualizarProveedor = ({ id, input }) => {
    const { nombre, telefono, ciudad } = input;
    return new Promise((resolve, reject) => {
        db.query(
            'UPDATE proveedores SET nombre = ?, telefono = ?, ciudad = ? WHERE id = ?',
            [nombre, telefono, ciudad, id],
            (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) return reject(new Error("Proveedor no encontrado"));
                resolve({ id, ...input });
            }
        );
    });
};

// Eliminar proveedor
const eliminarProveedor = ({ id }) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM proveedores WHERE id = ?', [id], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error("No se pudo eliminar: ID no existe"));
            resolve(`Proveedor con ID ${id} eliminado correctamente.`);
        });
    });
};

module.exports = {
    productos,
    producto,
    movimientos,
    registrarMovimiento,
    proveedores,
    proveedor,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor
};