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

  // Agregar nuevos métodos para trabajar con procesos

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

  async validarNotaExistente(
    procesoId: string,
    residenteId: string,
    mes: number
  ): Promise<boolean> {
    try {
      const notas = await this.getAll([
        where("procesoId", "==", procesoId),
        where("residenteId", "==", residenteId),
        where("mes", "==", mes),
      ]);
      return notas.length > 0;
    } catch (error) {
      console.error("Error al validar nota existente:", error);
      throw error;
    }
  }
}

export const notaService = new NotaService();
