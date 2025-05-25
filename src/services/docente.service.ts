import { where, orderBy } from "firebase/firestore"
import type { Docente } from "../types"
import { BaseService } from "./base.service"

class DocenteService extends BaseService<Docente> {
  constructor() {
    super("docentes")
  }

  async getAllOrdenados(): Promise<Docente[]> {
    try {
      return this.getAll([orderBy("apellidosNombres")])
    } catch (error) {
      console.error("Error al obtener docentes ordenados:", error)
      throw error
    }
  }

  async getHabilitados(): Promise<Docente[]> {
    try {
      return this.getAll([where("habilitado", "==", true), orderBy("apellidosNombres")])
    } catch (error) {
      console.error("Error al obtener docentes habilitados:", error)
      throw error
    }
  }

  async getBySede(sedeId: string): Promise<Docente[]> {
    try {
      return this.getAll([where("sedeId", "==", sedeId), orderBy("apellidosNombres")])
    } catch (error) {
      console.error("Error al obtener docentes por sede:", error)
      throw error
    }
  }

  async getHabilitadosBySede(sedeId: string): Promise<Docente[]> {
    try {
      return this.getAll([where("sedeId", "==", sedeId), where("habilitado", "==", true), orderBy("apellidosNombres")])
    } catch (error) {
      console.error("Error al obtener docentes habilitados por sede:", error)
      throw error
    }
  }

  async getByDni(dni: string): Promise<Docente | null> {
    try {
      const querySnapshot = await this.getAll([where("dni", "==", dni)])
      return querySnapshot.length > 0 ? querySnapshot[0] : null
    } catch (error) {
      console.error("Error al obtener docente por DNI:", error)
      throw error
    }
  }

  async checkDniDuplicate(dni: string, excludeId?: string): Promise<boolean> {
    try {
      const existingDocente = await this.getByDni(dni)
      if (!existingDocente) return false

      return excludeId ? existingDocente.id !== excludeId : true
    } catch (error) {
      console.error("Error al verificar DNI duplicado:", error)
      throw error
    }
  }
}

export const docenteService = new DocenteService()
