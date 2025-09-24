import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./proto/universidad.proto";

// Cargar proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).universidad;

// Bases de datos en memoria
const estudiantes = [];
const cursos = [];
// inscripciones: { ci: [codigos de curso] }
const inscripciones = {};

// Implementación de los métodos
const serviceImpl = {
  AgregarEstudiante: (call, callback) => {
    const nuevo = call.request;
    if (!estudiantes.find((e) => e.ci === nuevo.ci)) {
      estudiantes.push(nuevo);
    }
    callback(null, { estudiante: nuevo });
  },

  AgregarCurso: (call, callback) => {
    const curso = call.request;
    if (!cursos.find((c) => c.codigo === curso.codigo)) {
      cursos.push(curso);
    }
    callback(null, { curso });
  },

  InscribirEstudiante: (call, callback) => {
    const { ci, codigo } = call.request;

    // Inicializar array si no existe
    if (!inscripciones[ci]) inscripciones[ci] = [];

    // Revisar si ya está inscrito
    if (inscripciones[ci].includes(codigo)) {
      return callback({
        code: grpc.status.ALREADY_EXISTS,
        message: "El estudiante ya está inscrito en este curso",
      });
    }

    // Registrar la inscripción
    inscripciones[ci].push(codigo);
    callback(null, { mensaje: `${ci} → ${codigo}` });
  },

  ListarCursosDeEstudiante: (call, callback) => {
    const { ci } = call.request;
    const codigos = inscripciones[ci] || [];
    const cursosDelEstudiante = cursos.filter((c) =>
      codigos.includes(c.codigo)
    );
    callback(null, { cursos: cursosDelEstudiante });
  },

  ListarEstudiantesDeCurso: (call, callback) => {
    const { codigo } = call.request;
    const estudiantesDelCurso = estudiantes.filter((e) =>
      inscripciones[e.ci]?.includes(codigo)
    );
    callback(null, { estudiantes: estudiantesDelCurso });
  },
};

// Crear servidor
const server = new grpc.Server();
server.addService(proto.UniversidadService.service, serviceImpl);

const PORT = "50051";
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, bindPort) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Servidor gRPC escuchando en puerto ${bindPort}`);
    server.start();
  }
);
