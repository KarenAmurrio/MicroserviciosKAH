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

const estudiantes = [];
const cursos = [];
const inscripciones = []; 

const serviceImpl = {
    AgregarEstudiante: (call, callback) => {
        estudiantes.push(call.request);
        console.log(`[Servidor] Estudiante registrado: ${call.request.nombres}`);
        callback(null, { estudiante: call.request });
    },

    AgregarCurso: (call, callback) => {
        cursos.push(call.request);
        console.log(`[Servidor] Curso registrado: ${call.request.nombre}`);
        callback(null, { curso: call.request });
    },

    InscribirEstudiante: (call, callback) => {
        const { ci_estudiante, codigo_curso } = call.request;
        
        const existe = inscripciones.find(i => i.ci === ci_estudiante && i.codigo === codigo_curso);
        
        if (existe) {
            console.log(`[Servidor] Intento de duplicado bloqueado para CI: ${ci_estudiante} en Curso: ${codigo_curso}`);
            return callback({
                code: grpc.status.ALREADY_EXISTS,
                message: "El estudiante ya esta inscrito en este curso."
            });
        }

        inscripciones.push({ ci: ci_estudiante, codigo: codigo_curso });
        console.log(`[Servidor] Inscripcion exitosa -> CI: ${ci_estudiante} al curso: ${codigo_curso}`);
        callback(null, { mensaje: "Inscripcion exitosa" });
    },

    ListarCursosDeEstudiante: (call, callback) => {
        const { ci } = call.request;
        const codigos = inscripciones.filter(i => i.ci === ci).map(i => i.codigo);
        const cursosFiltrados = cursos.filter(c => codigos.includes(c.codigo));
        callback(null, { cursos: cursosFiltrados });
    },

    ListarEstudiantesDeCurso: (call, callback) => {
        const { codigo } = call.request;
        const cis = inscripciones.filter(i => i.codigo === codigo).map(i => i.ci);
        const estudiantesFiltrados = estudiantes.filter(e => cis.includes(e.ci));
        callback(null, { estudiantes: estudiantesFiltrados });
    }
};

const server = new grpc.Server();
server.addService(proto.UniversidadService.service, serviceImpl);

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        return console.error(err);
    }
    console.log(`Servidor gRPC ejecutandose en el puerto ${port}`);
});