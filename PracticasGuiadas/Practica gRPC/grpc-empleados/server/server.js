const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2/promise'); // <--- CAMBIO 1: Importar MySQL
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/empleado.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDef);
const rrhhProto = grpcObject.rrhh; 

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'rrhh_empleados'
});


//CREAR
async function crear(call, callback) {
    const { nombre, apellido, cargo } = call.request;
    try {
        const [result] = await db.query(
            'INSERT INTO empleados (nombre, apellido, cargo) VALUES (?, ?, ?)',
            [nombre, apellido, cargo]
        );
        callback(null, { id: result.insertId, nombre, apellido, cargo });
    } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: e.message });
    }
}

//LISTAR
// Nota: Lo cambiamos de "Stream" a "Unary" para que sea más sencillo
async function listar(call, callback) {
    try {
        const [rows] = await db.query('SELECT * FROM empleados');
        callback(null, { empleados: rows });
    } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: e.message });
    }
}

//ELIMINAR
async function eliminar(call, callback) {
    try {
        await db.query('DELETE FROM empleados WHERE id = ?', [call.request.id]);
        callback(null, { mensaje: "Empleado eliminado correctamente" });
    } catch (e) {
        callback({ code: grpc.status.INTERNAL, message: e.message });
    }
}

// ─── Iniciar servidor ──────────────────────────────────────────────────────
const server = new grpc.Server();

//Registrar los nuevos métodos
server.addService(rrhhProto.EmpleadoService.service, {
    Crear: crear,
    Listar: listar,
    Eliminar: eliminar
});

const ADDRESS = '0.0.0.0:50051';
server.bindAsync(ADDRESS, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) return console.error(err);
    console.log(`[Server] gRPC MySQL corriendo en puerto ${port}`);
});