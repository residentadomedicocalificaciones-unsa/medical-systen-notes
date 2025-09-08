import { where, orderBy } from "firebase/firestore";
import type { ProcesoResidentado, ProcesoConDetalles } from "../types";
import { BaseService } from "./base.service";

class ProcesoResidentadoService extends BaseService<ProcesoResidentado> {
  constructor() {
    super("procesos-residentado");
  }

  async getAllOrdenados(): Promise<ProcesoResidentado[]> {
    try {
      return this.getAll([orderBy("fechaInicio", "desc")]);
    } catch (error) {
      console.error("Error al obtener procesos ordenados:", error);
      throw error;
    }
  }

  async getByAnioAcademico(
    anioAcademico: string
  ): Promise<ProcesoResidentado[]> {
    try {
      return this.getAll([
        where("anioAcademico", "==", anioAcademico),
        orderBy("fechaInicio", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener procesos por año académico:", error);
      throw error;
    }
  }

  async getProcesosActivos(): Promise<ProcesoResidentado[]> {
    try {
      return this.getAll([
        where("activo", "==", true),
        orderBy("fechaInicio", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener procesos activos:", error);
      throw error;
    }
  }

  async getConDetalles(): Promise<ProcesoConDetalles[]> {
    try {
      const procesos = await this.getAllOrdenados();

      // Solo retornamos los procesos sin información adicional de sede/especialidad
      return procesos.map((proceso) => ({
        ...proceso,
      }));
    } catch (error) {
      console.error("Error al obtener procesos con detalles:", error);
      throw error;
    }
  }

  async validarFechas(
    fechaInicio: Date,
    fechaFin: Date,
    duracionMeses: number
  ): Promise<string | null> {
    if (fechaInicio >= fechaFin) {
      return "La fecha de inicio debe ser anterior a la fecha de fin";
    }

    // Calcular la diferencia en meses
    const diffTime = fechaFin.getTime() - fechaInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30.44); // Promedio de días por mes

    // La diferencia debe ser al menos duracionMeses - 1 para temas logísticos
    const minimoMeses = duracionMeses - 1;

    if (diffMonths < minimoMeses) {
      return `La duración entre fechas (${diffMonths} meses) debe ser al menos ${minimoMeses} meses para una duración de ${duracionMeses} meses`;
    }

    // No debe exceder por más de 2 meses la duración especificada
    if (diffMonths > duracionMeses + 2) {
      return `La duración entre fechas (${diffMonths} meses) excede demasiado la duración especificada (${duracionMeses} meses)`;
    }

    return null;
  }

  async create(
    data: Omit<ProcesoResidentado, "id" | "createdAt" | "updatedAt">
  ): Promise<ProcesoResidentado> {
    // Validar fechas antes de crear
    const validacionError = await this.validarFechas(
      data.fechaInicio instanceof Date
        ? data.fechaInicio
        : data.fechaInicio.toDate(),
      data.fechaFin instanceof Date ? data.fechaFin : data.fechaFin.toDate(),
      data.duracionMeses
    );

    if (validacionError) {
      throw new Error(validacionError);
    }

    return super.create(data);
  }

  async update(id: string, data: Partial<ProcesoResidentado>): Promise<void> {
    // Si se están actualizando las fechas o duración, validar
    if (data.fechaInicio || data.fechaFin || data.duracionMeses) {
      const procesoActual = await this.getById(id);
      if (!procesoActual) {
        throw new Error("Proceso no encontrado");
      }

      const fechaInicio = data.fechaInicio || procesoActual.fechaInicio;
      const fechaFin = data.fechaFin || procesoActual.fechaFin;
      const duracionMeses = data.duracionMeses || procesoActual.duracionMeses;

      const validacionError = await this.validarFechas(
        fechaInicio instanceof Date ? fechaInicio : fechaInicio.toDate(),
        fechaFin instanceof Date ? fechaFin : fechaFin.toDate(),
        duracionMeses
      );

      if (validacionError) {
        throw new Error(validacionError);
      }
    }

    return super.update(id, data);
  }
}

export const procesoResidentadoService = new ProcesoResidentadoService();
