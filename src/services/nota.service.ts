import { where, orderBy, limit } from "firebase/firestore";
import type { Nota } from "../types";
import { BaseService } from "./base.service";

class NotaService extends BaseService<Nota> {
  constructor() {
    super("notas");
  }

  async getByResidenteId(residenteId: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("residenteId", "==", residenteId),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por residente:", error);
      throw error;
    }
  }

  async getLatestNotas(limitCount = 5): Promise<Nota[]> {
    try {
      return this.getAll([orderBy("createdAt", "desc"), limit(limitCount)]);
    } catch (error) {
      console.error("Error al obtener últimas notas:", error);
      throw error;
    }
  }

  async getByHospital(hospital: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("hospital", "==", hospital),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por hospital:", error);
      throw error;
    }
  }

  async getByRotacion(rotacion: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("rotacion", "==", rotacion),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por rotación:", error);
      throw error;
    }
  }

  async getByEspecialidad(especialidad: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("especialidad", "==", especialidad),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por especialidad:", error);
      throw error;
    }
  }

  async getByAnioAcademico(anio: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("anioAcademico", "==", anio),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por año académico:", error);
      throw error;
    }
  }

  async getPromedioByResidente(residenteId: string): Promise<number | null> {
    try {
      const notas = await this.getByResidenteId(residenteId);

      if (notas.length === 0) {
        return null;
      }

      const sumaPromedios = notas.reduce((sum, nota) => sum + nota.promedio, 0);
      return sumaPromedios / notas.length;
    } catch (error) {
      console.error("Error al calcular promedio por residente:", error);
      throw error;
    }
  }

  async getEstadisticasPorEspecialidad(): Promise<
    Record<string, { count: number; promedio: number }>
  > {
    try {
      const notas = await this.getAll();
      const estadisticas: Record<
        string,
        { count: number; sumaPromedios: number; promedio: number }
      > = {};

      notas.forEach((nota) => {
        if (!estadisticas[nota.especialidad]) {
          estadisticas[nota.especialidad] = {
            count: 0,
            sumaPromedios: 0,
            promedio: 0,
          };
        }

        estadisticas[nota.especialidad].count++;
        estadisticas[nota.especialidad].sumaPromedios += nota.promedio;
      });

      // Calcular promedios
      Object.keys(estadisticas).forEach((especialidad) => {
        estadisticas[especialidad].promedio =
          estadisticas[especialidad].sumaPromedios /
          estadisticas[especialidad].count;
      });

      // Convertir a formato de retorno
      const resultado: Record<string, { count: number; promedio: number }> = {};
      Object.keys(estadisticas).forEach((especialidad) => {
        resultado[especialidad] = {
          count: estadisticas[especialidad].count,
          promedio: estadisticas[especialidad].promedio,
        };
      });

      return resultado;
    } catch (error) {
      console.error("Error al obtener estadísticas por especialidad:", error);
      throw error;
    }
  }

  // Métodos para trabajar con procesos

  async getByProcesoId(procesoId: string): Promise<Nota[]> {
    try {
      return this.getAll([
        where("procesoId", "==", procesoId),
        orderBy("mes", "asc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por proceso:", error);
      throw error;
    }
  }

  async getByProcesoYResidente(
    procesoId: string,
    residenteId: string
  ): Promise<Nota[]> {
    try {
      return this.getAll([
        where("procesoId", "==", procesoId),
        where("residenteId", "==", residenteId),
        orderBy("mes", "asc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por proceso y residente:", error);
      throw error;
    }
  }

  async getByProcesoYMes(procesoId: string, mes: number): Promise<Nota[]> {
    try {
      return this.getAll([
        where("procesoId", "==", procesoId),
        where("mes", "==", mes),
        orderBy("createdAt", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener notas por proceso y mes:", error);
      throw error;
    }
  }

  // Validación mejorada para prevenir duplicados
  async validarNotaExistente(
    procesoId: string,
    residenteId: string,
    mes: number
  ): Promise<Nota | null> {
    try {
      const notas = await this.getAll([
        where("procesoId", "==", procesoId),
        where("residenteId", "==", residenteId),
        where("mes", "==", mes),
        limit(1), // Solo necesitamos saber si existe una
      ]);
      return notas.length > 0 ? notas[0] : null;
    } catch (error) {
      console.error("Error al validar nota existente:", error);
      throw error;
    }
  }

  // Nuevo: Obtener seguimiento completo de un proceso
  async getSeguimientoProceso(procesoId: string): Promise<{
    totalResidentes: number;
    totalMeses: number;
    notasRegistradas: number;
    notasPendientes: number;
    porcentajeCompletado: number;
    detallesPorMes: Array<{
      mes: number;
      registradas: number;
      pendientes: number;
      porcentaje: number;
    }>;
  }> {
    try {
      // Obtener todas las notas del proceso
      const notas = await this.getByProcesoId(procesoId);

      // Obtener inscripciones del proceso (necesitamos importar el servicio)
      const { inscripcionProcesoService } = await import(
        "./inscripcion-proceso.service"
      );
      const inscripciones = await inscripcionProcesoService.getByProcesoId(
        procesoId
      );

      // Obtener datos del proceso
      const { procesoResidentadoService } = await import(
        "./proceso-residentado.service"
      );
      const proceso = await procesoResidentadoService.getById(procesoId);

      if (!proceso) {
        throw new Error("Proceso no encontrado");
      }

      const totalResidentes = inscripciones.filter((i) => i.activo).length;
      const totalMeses = proceso.duracionMeses;
      const totalNotasEsperadas = totalResidentes * totalMeses;
      const notasRegistradas = notas.length;
      const notasPendientes = totalNotasEsperadas - notasRegistradas;
      const porcentajeCompletado =
        totalNotasEsperadas > 0
          ? (notasRegistradas / totalNotasEsperadas) * 100
          : 0;

      // Calcular detalles por mes
      const detallesPorMes = [];
      for (let mes = 1; mes <= totalMeses; mes++) {
        const notasDelMes = notas.filter((n) => n.mes === mes).length;
        const pendientesDelMes = totalResidentes - notasDelMes;
        const porcentajeDelMes =
          totalResidentes > 0 ? (notasDelMes / totalResidentes) * 100 : 0;

        detallesPorMes.push({
          mes,
          registradas: notasDelMes,
          pendientes: pendientesDelMes,
          porcentaje: porcentajeDelMes,
        });
      }

      return {
        totalResidentes,
        totalMeses,
        notasRegistradas,
        notasPendientes,
        porcentajeCompletado,
        detallesPorMes,
      };
    } catch (error) {
      console.error("Error al obtener seguimiento del proceso:", error);
      throw error;
    }
  }

  // Nuevo: Obtener notas pendientes por residente
  async getNotasPendientesPorResidente(
    procesoId: string,
    residenteId: string
  ): Promise<number[]> {
    try {
      const notasExistentes = await this.getByProcesoYResidente(
        procesoId,
        residenteId
      );
      const mesesConNotas = notasExistentes.map((n) => n.mes);

      // Obtener duración del proceso
      const { procesoResidentadoService } = await import(
        "./proceso-residentado.service"
      );
      const proceso = await procesoResidentadoService.getById(procesoId);

      if (!proceso) {
        throw new Error("Proceso no encontrado");
      }

      const mesesPendientes = [];
      for (let mes = 1; mes <= proceso.duracionMeses; mes++) {
        if (!mesesConNotas.includes(mes)) {
          mesesPendientes.push(mes);
        }
      }

      return mesesPendientes;
    } catch (error) {
      console.error("Error al obtener notas pendientes por residente:", error);
      throw error;
    }
  }

  // Nuevo: Obtener resumen de notas por proceso y residente
  async getResumenNotasResidente(
    procesoId: string,
    residenteId: string
  ): Promise<{
    totalMeses: number;
    notasRegistradas: number;
    notasPendientes: number;
    porcentajeCompletado: number;
    promedioGeneral: number;
    mesesPendientes: number[];
  }> {
    try {
      const notas = await this.getByProcesoYResidente(procesoId, residenteId);
      const mesesPendientes = await this.getNotasPendientesPorResidente(
        procesoId,
        residenteId
      );

      // Obtener duración del proceso
      const { procesoResidentadoService } = await import(
        "./proceso-residentado.service"
      );
      const proceso = await procesoResidentadoService.getById(procesoId);

      if (!proceso) {
        throw new Error("Proceso no encontrado");
      }

      const totalMeses = proceso.duracionMeses;
      const notasRegistradas = notas.length;
      const notasPendientes = mesesPendientes.length;
      const porcentajeCompletado =
        totalMeses > 0 ? (notasRegistradas / totalMeses) * 100 : 0;

      // Calcular promedio general (solo notas con evaluación, no ausencias)
      const notasConEvaluacion = notas.filter((n) => !n.vacaciones);
      const promedioGeneral =
        notasConEvaluacion.length > 0
          ? notasConEvaluacion.reduce((sum, n) => sum + n.promedio, 0) /
            notasConEvaluacion.length
          : 0;

      return {
        totalMeses,
        notasRegistradas,
        notasPendientes,
        porcentajeCompletado,
        promedioGeneral,
        mesesPendientes,
      };
    } catch (error) {
      console.error("Error al obtener resumen de notas del residente:", error);
      throw error;
    }
  }
}

export const notaService = new NotaService();
