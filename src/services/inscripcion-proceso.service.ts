import { where, orderBy } from "firebase/firestore";
import type { InscripcionProceso, InscripcionConDetalles } from "../types";
import { BaseService } from "./base.service";
import { residenteService } from "./residente.service";
import { procesoResidentadoService } from "./proceso-residentado.service";

class InscripcionProcesoService extends BaseService<InscripcionProceso> {
  constructor() {
    super("inscripciones-proceso");
  }

  async getByProcesoId(procesoId: string): Promise<InscripcionProceso[]> {
    try {
      return this.getAll([
        where("procesoId", "==", procesoId),
        where("activo", "==", true),
        orderBy("fechaInscripcion", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener inscripciones por proceso:", error);
      throw error;
    }
  }

  async getByResidenteId(residenteId: string): Promise<InscripcionProceso[]> {
    try {
      return this.getAll([
        where("residenteId", "==", residenteId),
        where("activo", "==", true),
        orderBy("fechaInscripcion", "desc"),
      ]);
    } catch (error) {
      console.error("Error al obtener inscripciones por residente:", error);
      throw error;
    }
  }

  async getInscripcionesConDetalles(
    procesoId?: string
  ): Promise<InscripcionConDetalles[]> {
    try {
      let inscripciones: InscripcionProceso[];

      if (procesoId) {
        inscripciones = await this.getByProcesoId(procesoId);
      } else {
        inscripciones = await this.getAll([
          where("activo", "==", true),
          orderBy("fechaInscripcion", "desc"),
        ]);
      }

      const residentes = await residenteService.getAll();
      const procesos = await procesoResidentadoService.getAll();

      return inscripciones.map((inscripcion) => ({
        ...inscripcion,
        residenteNombre:
          residentes.find((r) => r.id === inscripcion.residenteId)?.nombre ||
          "No encontrado",
        procesoNombre:
          procesos.find((p) => p.id === inscripcion.procesoId)?.nombre ||
          "No encontrado",
      }));
    } catch (error) {
      console.error("Error al obtener inscripciones con detalles:", error);
      throw error;
    }
  }

  async getResidentesDisponibles(
    procesoId: string,
    anioAcademico: string
  ): Promise<any[]> {
    try {
      // Obtener todos los residentes del año académico
      const todosResidentes = await residenteService.getByAnioAcademico(
        anioAcademico
      );

      // Obtener residentes ya inscritos en este proceso
      const inscripciones = await this.getByProcesoId(procesoId);
      const residentesInscritos = inscripciones.map((i) => i.residenteId);

      // Filtrar residentes disponibles
      return todosResidentes.filter(
        (residente) => !residentesInscritos.includes(residente.id!)
      );
    } catch (error) {
      console.error("Error al obtener residentes disponibles:", error);
      throw error;
    }
  }

  async inscribirResidente(
    procesoId: string,
    residenteId: string
  ): Promise<InscripcionProceso> {
    try {
      // Verificar si ya existe una inscripción activa
      const inscripcionExistente = await this.getAll([
        where("procesoId", "==", procesoId),
        where("residenteId", "==", residenteId),
        where("activo", "==", true),
      ]);

      if (inscripcionExistente.length > 0) {
        throw new Error("El residente ya está inscrito en este proceso");
      }

      const nuevaInscripcion: Omit<InscripcionProceso, "id"> = {
        procesoId,
        residenteId,
        fechaInscripcion: new Date(),
        activo: true,
      };

      return this.create(nuevaInscripcion);
    } catch (error) {
      console.error("Error al inscribir residente:", error);
      throw error;
    }
  }

  async desinscribirResidente(
    procesoId: string,
    residenteId: string
  ): Promise<void> {
    try {
      const inscripciones = await this.getAll([
        where("procesoId", "==", procesoId),
        where("residenteId", "==", residenteId),
        where("activo", "==", true),
      ]);

      if (inscripciones.length === 0) {
        throw new Error("No se encontró la inscripción");
      }

      // Desactivar la inscripción en lugar de eliminarla
      await this.update(inscripciones[0].id!, { activo: false });
    } catch (error) {
      console.error("Error al desinscribir residente:", error);
      throw error;
    }
  }
}

export const inscripcionProcesoService = new InscripcionProcesoService();
