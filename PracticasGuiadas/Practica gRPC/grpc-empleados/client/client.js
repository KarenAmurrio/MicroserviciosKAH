const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/empleado.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDef);
const rrhhProto = grpcObject.rrhh; 

// Crear el stub
const client = new rrhhProto.EmpleadoService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// ─── Métodos de prueba ──────────────────────────────────────────────────────

//CREAR
function crearEmpleado(nombre, apellido, cargo) {
  console.log(`\n[Cliente] Creando empleado: ${nombre}...`);
  client.Crear({ nombre, apellido, cargo }, (error, response) => {
    if (error) return console.error('[Error]:', error.message);
    console.log('✅ Empleado creado en MySQL:');
    console.table(response);
  });
}

//LISTAR(Ahora es Unary, no Streaming)
function listar() {
  console.log('\n[Cliente] Solicitando lista de empleados...');
  client.Listar({}, (error, response) => {
    if (error) return console.error('[Error]:', error.message);
    console.log('📋 Empleados encontrados:');
    console.table(response.empleados);
  });
}

//ELIMINAR EMPLEADO
function eliminar(id) {
  console.log(`\n[Cliente] Eliminando empleado con ID: ${id}`);
  client.Eliminar({ id }, (error, response) => {
    if (error) return console.error('[Error]:', error.message);
    console.log('Respuesta:', response.mensaje);
  });
}

// ─── Control de comandos desde la terminal ──────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--crear')) {
  //node client.js --crear "Maria" "Flores" "Desarrolladora"
  const n = args[1] || "Nuevo";
  const a = args[2] || "Empleado";
  const c = args[3] || "Cargo";
  crearEmpleado(n, a, c);
} else if (args.includes('--eliminar')) {
  //node client.js --eliminar 5
  const id = parseInt(args[1]);
  eliminar(id);
} else {
  // Por defecto listamos todo
  listar();
}