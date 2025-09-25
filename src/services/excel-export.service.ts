import ExcelJS from "exceljs";
import type {
  Nota,
  Residente,
  ProcesoResidentado,
  Sede,
  Especialidad,
} from "../types";
import { getMesNombrePorNumero } from "../utils/dateUtils";

export interface ExportData {
  proceso: ProcesoResidentado;
  residentes: Residente[];
  notas: Nota[];
  sedes: Sede[];
  especialidades: Especialidad[];
}

export class ExcelExportService {
  static async exportarNotasProceso(data: ExportData): Promise<void> {
    const { proceso, residentes, notas, sedes, especialidades } = data;

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Evaluaciones");

    // Obtener fechas de inicio para calcular nombres de meses
    const fechaInicio =
      proceso.fechaInicio instanceof Date
        ? proceso.fechaInicio
        : proceso.fechaInicio.toDate();

    const fechaFin =
      proceso.fechaFin instanceof Date
        ? proceso.fechaFin
        : proceso.fechaFin.toDate();

    // Crear título principal
    const titulo = `Evaluación Mensual Asistencial de ${proceso.anioAcademico}° de ${proceso.nombre}`;

    // Crear headers dinámicos basados en la duración del proceso
    const mesesHeaders = [];
    for (let i = 1; i <= proceso.duracionMeses; i++) {
      const mesNombre = getMesNombrePorNumero(i, fechaInicio);
      mesesHeaders.push(mesNombre);
    }

    // Headers principales
    const headers = [
      "Nro.",
      "Apellidos y Nombres",
      "Sede (Hospital)",
      ...mesesHeaders,
      "Promedio Final",
      "Nota Final (80%)",
    ];

    // Agrupar residentes por especialidad
    const residentesPorEspecialidad = new Map<string, Residente[]>();

    residentes.forEach((residente) => {
      const especialidadId = residente.especialidadId || "sin-especialidad";
      if (!residentesPorEspecialidad.has(especialidadId)) {
        residentesPorEspecialidad.set(especialidadId, []);
      }
      residentesPorEspecialidad.get(especialidadId)!.push(residente);
    });

    let currentRow = 1;

    // Agregar título
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = titulo;
    titleCell.font = { bold: true, size: 14, color: { argb: "FF000000" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6FA" },
    };
    titleCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    currentRow++;

    // Agregar fila de fechas
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
    const dateCell = worksheet.getCell(currentRow, 1);
    dateCell.value =
      fechaInicio.toLocaleDateString("es-ES") +
      " - " +
      fechaFin.toLocaleDateString("es-ES");
    dateCell.font = { italic: true, color: { argb: "FF666666" } };
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    currentRow++;

    // Fila vacía
    currentRow++;

    // Agregar headers
    headers.forEach((header, index) => {
      const headerCell = worksheet.getCell(currentRow, index + 1);
      headerCell.value = header;
      headerCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF366092" },
      };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };
      headerCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    currentRow++;

    let numeroOrden = 1;

    // Procesar cada especialidad
    residentesPorEspecialidad.forEach(
      (residentesEspecialidad, especialidadId) => {
        // Encontrar nombre de especialidad
        const especialidad = especialidades.find(
          (e) => e.id === especialidadId
        );
        const nombreEspecialidad = especialidad?.nombre || "Sin Especialidad";

        // Agregar fila de especialidad
        worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
        const especialidadCell = worksheet.getCell(currentRow, 1);
        especialidadCell.value = nombreEspecialidad.toUpperCase();
        especialidadCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        especialidadCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        };
        especialidadCell.alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        especialidadCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        currentRow++;

        // Procesar residentes de esta especialidad
        residentesEspecialidad.forEach((residente) => {
          const notasResidente = notas.filter(
            (n) => n.residenteId === residente.id
          );

          // Crear objeto para almacenar notas por mes
          const notasPorMes: { [key: number]: Nota } = {};
          notasResidente.forEach((nota) => {
            notasPorMes[nota.mes] = nota;
          });

          // Encontrar sede del residente
          const sede = sedes.find((s) => s.id === residente.sedeRotacionId);
          const nombreSede = sede?.nombre || "Sin Sede";

          const rowData: any[] = [numeroOrden, residente.nombre, nombreSede];

          // Agregar datos de cada mes y calcular promedio
          let sumaPromedios = 0;
          let countEvaluaciones = 0;
          const promediosMeses: (number | string)[] = [];

          for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
            const nota = notasPorMes[mes];
            if (nota) {
              if (nota.vacaciones) {
                const tipoAusencia = nota.tipoAusencia || "Vacaciones";
                promediosMeses.push(tipoAusencia);
                // Las ausencias/vacaciones cuentan como 0 para el promedio final
                sumaPromedios += 0;
                countEvaluaciones++;
              } else {
                const promedio = Number.parseFloat(nota.promedio.toFixed(2));
                promediosMeses.push(promedio);
                sumaPromedios += promedio;
                countEvaluaciones++;
              }
            } else {
              promediosMeses.push("Pendiente");
              // Las evaluaciones pendientes cuentan como 0
              sumaPromedios += 0;
              countEvaluaciones++;
            }
          }

          // Agregar promedios de meses
          rowData.push(...promediosMeses);

          // Calcular promedio final (incluyendo ausencias como 0)
          const promedioFinal = countEvaluaciones > 0 ? sumaPromedios / 12 : 0;

          // Calcular nota final (80% del promedio final)
          const notaFinal = promedioFinal * 0.8;

          rowData.push(
            Number.parseFloat(promedioFinal.toFixed(2)),
            Number.parseFloat(notaFinal.toFixed(2))
          );

          // Agregar fila de datos
          rowData.forEach((value, index) => {
            const cell = worksheet.getCell(currentRow, index + 1);
            cell.value = value;
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });

          currentRow++;
          numeroOrden++;
        });
      }
    );

    // Configurar anchos de columna
    worksheet.getColumn(1).width = 5; // Nro
    worksheet.getColumn(2).width = 35; // Nombres
    worksheet.getColumn(3).width = 25; // Sede

    // Agregar anchos para columnas de meses
    for (let i = 4; i <= 3 + proceso.duracionMeses; i++) {
      worksheet.getColumn(i).width = 15;
    }

    // Agregar anchos para columnas finales
    worksheet.getColumn(3 + proceso.duracionMeses + 1).width = 15; // Promedio Final
    worksheet.getColumn(3 + proceso.duracionMeses + 2).width = 15; // Nota Final

    // Crear hoja de resumen
    const resumenWorksheet = workbook.addWorksheet("Resumen");

    let resumenRow = 1;

    // Título del resumen
    const resumenTitleCell = resumenWorksheet.getCell(resumenRow, 1);
    resumenTitleCell.value = "RESUMEN DEL PROCESO";
    resumenTitleCell.font = { bold: true, size: 12 };
    resumenRow += 2;

    // Información del proceso
    const infoData = [
      ["Proceso:", proceso.nombre],
      ["Año Académico:", `${proceso.anioAcademico}° Año`],
      ["Duración:", `${proceso.duracionMeses} meses`],
      ["Fecha Inicio:", fechaInicio.toLocaleDateString("es-ES")],
      ["Fecha Fin:", fechaFin.toLocaleDateString("es-ES")],
    ];

    infoData.forEach(([label, value]) => {
      resumenWorksheet.getCell(resumenRow, 1).value = label;
      resumenWorksheet.getCell(resumenRow, 2).value = value;
      resumenRow++;
    });

    resumenRow += 2;

    // Estadísticas por especialidad
    const estadisticasTitleCell = resumenWorksheet.getCell(resumenRow, 1);
    estadisticasTitleCell.value = "ESTADÍSTICAS POR ESPECIALIDAD";
    estadisticasTitleCell.font = { bold: true };
    resumenRow += 2;

    residentesPorEspecialidad.forEach((residentesEsp, especialidadId) => {
      const especialidad = especialidades.find((e) => e.id === especialidadId);
      const nombreEspecialidad = especialidad?.nombre || "Sin Especialidad";

      const notasEspecialidad = notas.filter(
        (n) =>
          residentesEsp.some((r) => r.id === n.residenteId) && !n.vacaciones
      );

      const promedio =
        notasEspecialidad.length > 0
          ? notasEspecialidad.reduce((sum, n) => sum + n.promedio, 0) /
            notasEspecialidad.length
          : 0;

      resumenWorksheet.getCell(resumenRow, 1).value = nombreEspecialidad;
      resumenWorksheet.getCell(
        resumenRow,
        2
      ).value = `${residentesEsp.length} residentes`;
      resumenWorksheet.getCell(
        resumenRow,
        3
      ).value = `Promedio: ${promedio.toFixed(2)}`;
      resumenRow++;
    });

    // Configurar anchos de columna del resumen
    resumenWorksheet.getColumn(1).width = 25;
    resumenWorksheet.getColumn(2).width = 20;
    resumenWorksheet.getColumn(3).width = 20;

    // Generar nombre de archivo
    const fechaExport = new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-");
    const nombreArchivo = `Evaluacion_Mensual_${
      proceso.anioAcademico
    }Año_${proceso.nombre.replace(/\s+/g, "_")}_${fechaExport}.xlsx`;

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static async exportarNotasResidente(
    residente: Residente,
    notas: Nota[],
    proceso: ProcesoResidentado
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Evaluaciones");

    const fechaInicio =
      proceso.fechaInicio instanceof Date
        ? proceso.fechaInicio
        : proceso.fechaInicio.toDate();

    // Headers para reporte individual
    const headers = [
      "Mes",
      "Fecha Evaluación",
      "Encargado Evaluación",
      "Hospital",
      "Servicio",
      "Estado",
      "Conocimientos",
      "Habilidades",
      "Aptitudes",
      "Promedio",
      "Observaciones",
    ];

    // Agregar headers
    headers.forEach((header, index) => {
      const headerCell = worksheet.getCell(1, index + 1);
      headerCell.value = header;
      headerCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF366092" },
      };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };
      headerCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Crear filas de datos
    let currentRow = 2;
    for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
      const nota = notas.find((n) => n.mes === mes);
      const mesNombre = getMesNombrePorNumero(mes, fechaInicio);

      const rowData: any[] = [];

      if (nota) {
        const fechaEvaluacion =
          nota.createdAt instanceof Date
            ? nota.createdAt.toLocaleDateString("es-ES")
            : nota.createdAt?.toDate?.()?.toLocaleDateString("es-ES") || "";

        rowData.push(
          mesNombre,
          fechaEvaluacion,
          nota.encargadoEvaluacion,
          nota.hospital,
          nota.rotacion,
          nota.vacaciones ? nota.tipoAusencia || "Vacaciones" : "Activo",
          nota.vacaciones ? "-" : nota.conocimientos.toFixed(2),
          nota.vacaciones ? "-" : nota.habilidades.toFixed(2),
          nota.vacaciones ? "-" : nota.aptitudes.toFixed(2),
          nota.vacaciones ? "-" : nota.promedio.toFixed(2),
          nota.observacion || ""
        );
      } else {
        rowData.push(
          mesNombre,
          "",
          "",
          "",
          "",
          "Pendiente",
          "",
          "",
          "",
          "",
          ""
        );
      }

      // Agregar fila de datos
      rowData.forEach((value, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = value;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      currentRow++;
    }

    // Configurar anchos de columna
    worksheet.getColumn(1).width = 20; // Mes
    worksheet.getColumn(2).width = 15; // Fecha
    worksheet.getColumn(3).width = 25; // Encargado
    worksheet.getColumn(4).width = 20; // Hospital
    worksheet.getColumn(5).width = 20; // Servicio
    worksheet.getColumn(6).width = 15; // Estado
    worksheet.getColumn(7).width = 12; // Conocimientos
    worksheet.getColumn(8).width = 12; // Habilidades
    worksheet.getColumn(9).width = 12; // Aptitudes
    worksheet.getColumn(10).width = 12; // Promedio
    worksheet.getColumn(11).width = 30; // Observaciones

    // Generar nombre de archivo
    const fechaExport = new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-");
    const nombreArchivo = `Evaluaciones_${residente.nombre.replace(
      /\s+/g,
      "_"
    )}_${fechaExport}.xlsx`;

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
