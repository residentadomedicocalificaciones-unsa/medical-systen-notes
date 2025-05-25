import { orderBy } from "firebase/firestore"
import type { Sede } from "../types"
import { BaseService } from "./base.service"

class SedeService extends BaseService<Sede> {
  constructor() {
    super("sedes")
  }

  async getAllOrdenadas(): Promise<Sede[]> {
    try {
      return this.getAll([orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener sedes ordenadas:", error)
      throw error
    }
  }
}

export const sedeService = new SedeService()
