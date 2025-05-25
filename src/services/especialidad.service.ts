import { orderBy } from "firebase/firestore"
import type { Especialidad } from "../types"
import { BaseService } from "./base.service"

class EspecialidadService extends BaseService<Especialidad> {
  constructor() {
    super("especialidades")
  }

  async getAllOrdenadas(): Promise<Especialidad[]> {
    try {
      return this.getAll([orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener especialidades ordenadas:", error)
      throw error
    }
  }
}

export const especialidadService = new EspecialidadService()
