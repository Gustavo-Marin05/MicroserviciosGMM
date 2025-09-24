import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./proto/universidad.proto";

// Cargar proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).universidad;

// Crear cliente
const client = new proto.UniversidadService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// --- Función auxiliar para manejar errores ---
function handleError(err) {
  if (!err) return false;
  if (err.code === grpc.status.ALREADY_EXISTS) {
    console.log("⚠️ El estudiante ya está inscrito en este curso");
  } else {
    console.error(err);
  }
  return true;
}

// --- DEMOSTRACIÓN ---
client.AgregarEstudiante(
  { ci: "123", nombres: "gustavi", apellidos: "Vil", carrera: "Sistemas" },
  (err, resEst) => {
    if (handleError(err)) return;

    console.log("Estudiante agregado:", resEst.estudiante);

    client.AgregarCurso(
      { codigo: "sis320", nombre: "operacions", docente: "ovando" },
      (err, resCurso1) => {
        if (handleError(err)) return;
        console.log("Curso agregado:", resCurso1.curso);

        // Intentar inscribir al estudiante
        const cursosAInscribir = ["sis320"];
        cursosAInscribir.forEach((codigoCurso) => {
          client.InscribirEstudiante(
            { ci: "123", codigo: codigoCurso },
            (err, resIns) => {
              if (err) {
                if (err.code === grpc.status.ALREADY_EXISTS) {
                  console.log(
                    ` El estudiante ya está inscrito en el curso ${codigoCurso}`
                  );
                } else {
                  console.error(err);
                }
              } else {
                console.log(resIns.mensaje);
              }
            }
          );
        });

        // Listar cursos del estudiante
        setTimeout(() => {
          client.ListarCursosDeEstudiante({ ci: "123" }, (err, resCursos) => {
            if (handleError(err)) return;
            console.log("Cursos del alumno:", resCursos.cursos);

            // Listar estudiantes de un curso
            client.ListarEstudiantesDeCurso(
              { codigo: "sis420" },
              (err, resEsts) => {
                if (handleError(err)) return;
                console.log("Estudiantes en sis420:", resEsts.estudiantes);
              }
            );
          });
        }, 500);
      }
    );
  }
);
