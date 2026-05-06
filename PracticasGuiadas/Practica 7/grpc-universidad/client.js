import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./proto/universidad.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDefinition).universidad;

const client = new proto.UniversidadService("localhost:50051", grpc.credentials.createInsecure());

const util = (fn, arg) => new Promise((resolve, reject) => {
    fn.call(client, arg, (err, res) => err ? reject(err) : resolve(res));
});

async function ejecutarPruebas() {
    try {
        console.log("==========================================");
        console.log(" INICIANDO PRUEBAS DEL CLIENTE gRPC");
        console.log("==========================================\n");

        console.log("1. --- Registrando Estudiante ---");
        await util(client.AgregarEstudiante, { ci: "123", nombres: "Juan", apellidos: "Perez", carrera: "Sistemas" });
        console.log("   Estudiante registrado con exito.\n");

        console.log("2. --- Registrando Cursos ---");
        await util(client.AgregarCurso, { codigo: "CS1", nombre: "Microservicios", docente: "Ing. Montellano" });
        await util(client.AgregarCurso, { codigo: "CS2", nombre: "Base de Datos", docente: "Ing. Sanchez" });
        console.log("   Cursos registrados con exito.\n");

        console.log("3. --- Inscribiendo Estudiante en cursos ---");
        await util(client.InscribirEstudiante, { ci_estudiante: "123", codigo_curso: "CS1" });
        await util(client.InscribirEstudiante, { ci_estudiante: "123", codigo_curso: "CS2" });
        console.log("   Inscripciones realizadas con exito.\n");

        console.log("4. --- Consultando Cursos del Estudiante ---");
        const cursosRes = await util(client.ListarCursosDeEstudiante, { ci: "123" });
        console.log("   Cursos de Juan:", cursosRes.cursos.map(c => c.nombre).join(", ") || "Ninguno");
        console.log("");

        console.log("5. --- Consultando Estudiantes de un Curso (CS1) ---");
        const estudiantesRes = await util(client.ListarEstudiantesDeCurso, { codigo: "CS1" });
        console.log("   Estudiantes en Microservicios:", estudiantesRes.estudiantes.map(e => e.nombres).join(", ") || "Ninguno");
        console.log("");

        console.log("==========================================");
        console.log(" TODAS LAS PRUEBAS FINALIZARON CON EXITO");
        console.log("==========================================");

    } catch (error) {
        console.error("\nERROR DETENIDO EN LA PRUEBA:");
        console.error("Mensaje:", error.message || error);
    }
}

ejecutarPruebas();