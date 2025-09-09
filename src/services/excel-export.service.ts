import * as XLSX from "xlsx";
import type { Nota, Residente, ProcesoResidentado } from "../types";
import { getMesNombrePorNumero } from "../utils/dateUtils";

export interface ExportData {
  proceso: ProcesoResidentado;
  residentes: Residente[];
  notas: Nota[];
}

export class ExcelExportService {
  static exportarNotasProceso(data: ExportData): void {
    const { proceso, residentes, notas } = data;

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Obtener fechas de inicio para calcular nombres de meses
    const fechaInicio =
      proceso.fechaInicio instanceof Date
        ? proceso.fechaInicio
        : proceso.fechaInicio.toDate();

    // Crear headers dinámicos basados en la duración del proceso
    const mesesHeaders = [];
    for (let i = 1; i <= proceso.duracionMeses; i++) {
      const mesNombre = getMesNombrePorNumero(i, fechaInicio);
      mesesHeaders.push(`${mesNombre} - Conocimientos`);
      mesesHeaders.push(`${mesNombre} - Habilidades`);
      mesesHeaders.push(`${mesNombre} - Aptitudes`);
      mesesHeaders.push(`${mesNombre} - Promedio`);
      mesesHeaders.push(`${mesNombre} - Estado`);
    }

    // Headers principales
    const headers = [
      "Nro.",
      "Apellidos y Nombres",
      "CUI",
      "DNI",
      "Especialidad",
      "Año Académico",
      ...mesesHeaders,
      "Promedio General",
      "Total Evaluaciones",
      "Evaluaciones Pendientes",
    ];

    // Crear datos de filas
    const rows = residentes.map((residente, index) => {
      const notasResidente = notas.filter(
        (n) => n.residenteId === residente.id
      );

      // Crear objeto para almacenar notas por mes
      const notasPorMes: { [key: number]: Nota } = {};
      notasResidente.forEach((nota) => {
        notasPorMes[nota.mes] = nota;
      });

      const row: any[] = [
        index + 1,
        residente.nombre,
        residente.cui,
        residente.dni,
        residente.especialidadId || "",
        residente.anioAcademico,
      ];

      // Agregar datos de cada mes
      let sumaPromedios = 0;
      let countEvaluaciones = 0;

      for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
        const nota = notasPorMes[mes];

        if (nota) {
          if (nota.vacaciones) {
            row.push("-", "-", "-", "-", nota.tipoAusencia || "Vacaciones");
          } else {
            row.push(
              nota.conocimientos.toFixed(2),
              nota.habilidades.toFixed(2),
              nota.aptitudes.toFixed(2),
              nota.promedio.toFixed(2),
              "Activo"
            );
            sumaPromedios += nota.promedio;
            countEvaluaciones++;
          }
        } else {
          row.push("", "", "", "", "Pendiente");
        }
      }

      // Calcular promedio general y estadísticas
      const promedioGeneral =
        countEvaluaciones > 0 ? sumaPromedios / countEvaluaciones : 0;
      const evaluacionesPendientes =
        proceso.duracionMeses - notasResidente.length;

      row.push(
        promedioGeneral.toFixed(2),
        notasResidente.length,
        evaluacionesPendientes
      );

      return row;
    });

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Configurar anchos de columna
    const colWidths = [
      { wch: 5 }, // Nro
      { wch: 30 }, // Nombres
      { wch: 12 }, // CUI
      { wch: 12 }, // DNI
      { wch: 20 }, // Especialidad
      { wch: 12 }, // Año
    ];

    // Agregar anchos para columnas de meses
    for (let i = 0; i < proceso.duracionMeses * 5; i++) {
      colWidths.push({ wch: 12 });
    }

    // Agregar anchos para columnas finales
    colWidths.push({ wch: 15 }, { wch: 15 }, { wch: 18 });

    worksheet["!cols"] = colWidths;

    // Aplicar estilos a headers
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    // Aplicar bordes a todas las celdas con datos
    for (let row = 0; row <= headerRange.e.r; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: "", t: "s" };
        }

        if (!worksheet[cellAddress].s) {
          worksheet[cellAddress].s = {};
        }

        worksheet[cellAddress].s.border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        };

        // Centrar contenido numérico
        if (col > 1 && row > 0) {
          worksheet[cellAddress].s.alignment = {
            horizontal: "center",
            vertical: "center",
          };
        }
      }
    }

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluaciones");

    // Crear hoja de resumen
    const resumenData = [
      ["RESUMEN DEL PROCESO"],
      [""],
      ["Proceso:", proceso.nombre],
      ["Año Académico:", `${proceso.anioAcademico}° Año`],
      ["Duración:", `${proceso.duracionMeses} meses`],
      ["Fecha Inicio:", fechaInicio.toLocaleDateString("es-ES")],
      [
        "Fecha Fin:",
        (proceso.fechaFin instanceof Date
          ? proceso.fechaFin
          : proceso.fechaFin.toDate()
        ).toLocaleDateString("es-ES"),
      ],
      [""],
      ["ESTADÍSTICAS"],
      [""],
      ["Total Residentes:", residentes.length],
      ["Total Evaluaciones Registradas:", notas.length],
      [
        "Total Evaluaciones Esperadas:",
        residentes.length * proceso.duracionMeses,
      ],
      [
        "Porcentaje Completado:",
        `${(
          (notas.length / (residentes.length * proceso.duracionMeses)) *
          100
        ).toFixed(2)}%`,
      ],
      [""],
      ["PROMEDIO POR MES"],
      [""],
    ];

    // Agregar estadísticas por mes
    for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
      const notasDelMes = notas.filter((n) => n.mes === mes && !n.vacaciones);
      const promedio =
        notasDelMes.length > 0
          ? notasDelMes.reduce((sum, n) => sum + n.promedio, 0) /
            notasDelMes.length
          : 0;

      resumenData.push([
        getMesNombrePorNumero(mes, fechaInicio),
        `${notasDelMes.length} evaluaciones`,
        `Promedio: ${promedio.toFixed(2)}`,
      ]);
    }

    const resumenWorksheet = XLSX.utils.aoa_to_sheet(resumenData);
    resumenWorksheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, resumenWorksheet, "Resumen");

    // Generar nombre de archivo
    const fechaExport = new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-");
    const nombreArchivo = `Evaluaciones_${proceso.nombre.replace(
      /\s+/g,
      "_"
    )}_${fechaExport}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  }

  static exportarNotasResidente(
    residente: Residente,
    notas: Nota[],
    proceso: ProcesoResidentado
  ): void {
    const workbook = XLSX.utils.book_new();

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

    // Crear filas de datos
    const rows = [];
    for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
      const nota = notas.find((n) => n.mes === mes);
      const mesNombre = getMesNombrePorNumero(mes, fechaInicio);

      if (nota) {
        const fechaEvaluacion =
          nota.createdAt instanceof Date
            ? nota.createdAt.toLocaleDateString("es-ES")
            : nota.createdAt?.toDate?.()?.toLocaleDateString("es-ES") || "";

        rows.push([
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
          nota.observacion || "",
        ]);
      } else {
        rows.push([mesNombre, "", "", "", "", "Pendiente", "", "", "", "", ""]);
      }
    }

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Configurar anchos
    worksheet["!cols"] = [
      { wch: 20 }, // Mes
      { wch: 15 }, // Fecha
      { wch: 25 }, // Encargado
      { wch: 20 }, // Hospital
      { wch: 20 }, // Servicio
      { wch: 15 }, // Estado
      { wch: 12 }, // Conocimientos
      { wch: 12 }, // Habilidades
      { wch: 12 }, // Aptitudes
      { wch: 12 }, // Promedio
      { wch: 30 }, // Observaciones
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluaciones");

    // Generar nombre de archivo
    const fechaExport = new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-");
    const nombreArchivo = `Evaluaciones_${residente.nombre.replace(
      /\s+/g,
      "_"
    )}_${fechaExport}.xlsx`;

    XLSX.writeFile(workbook, nombreArchivo);
  }
}
