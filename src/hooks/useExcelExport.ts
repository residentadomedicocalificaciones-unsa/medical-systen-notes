"use client";

import { useState } from "react";
import {
  ExcelExportService,
  type ExportData,
} from "../services/excel-export.service";
import { notaService } from "../services/nota.service";
import { inscripcionProcesoService } from "../services/inscripcion-proceso.service";
import { sedeService } from "../services/sede.service";
import { especialidadService } from "../services/especialidad.service";
import type { Residente, ProcesoResidentado } from "../types";

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportarNotasProceso = async (
    proceso: ProcesoResidentado,
    residentes: Residente[]
  ) => {
    try {
      setIsExporting(true);
      setError(null);

      // Obtener todas las notas del proceso
      const notas = await notaService.getByProcesoId(proceso.id!);

      // Obtener solo residentes inscritos en el proceso
      const inscripciones = await inscripcionProcesoService.getByProcesoId(
        proceso.id!
      );
      const residentesInscritos = residentes.filter((r) =>
        inscripciones.some((i) => i.residenteId === r.id && i.activo)
      );

      // Obtener sedes y especialidades
      const sedes = await sedeService.getAll();
      const especialidades = await especialidadService.getAll();

      const exportData: ExportData = {
        proceso,
        residentes: residentesInscritos,
        notas,
        sedes,
        especialidades,
      };

      ExcelExportService.exportarNotasProceso(exportData);
    } catch (err) {
      console.error("Error al exportar:", err);
      setError("Error al exportar las notas. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportarNotasResidente = async (
    residente: Residente,
    proceso: ProcesoResidentado
  ) => {
    try {
      setIsExporting(true);
      setError(null);

      // Obtener notas del residente en el proceso
      const notas = await notaService.getByProcesoYResidente(
        proceso.id!,
        residente.id!
      );

      ExcelExportService.exportarNotasResidente(residente, notas, proceso);
    } catch (err) {
      console.error("Error al exportar:", err);
      setError(
        "Error al exportar las notas del residente. Inténtalo de nuevo."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportarNotasProceso,
    exportarNotasResidente,
    isExporting,
    error,
  };
};
