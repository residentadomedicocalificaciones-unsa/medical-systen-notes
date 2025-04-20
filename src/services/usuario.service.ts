import { query, where, getDocs, limit } from "firebase/firestore"
import type { Usuario } from "../types"
import { BaseService } from "./base.service"

class UsuarioService extends BaseService<Usuario> {
  constructor() {
    super("usuarios")
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    try {
      const q = query(this.getCollection(), where("email", "==", email), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data(),
        } as Usuario
      }

      return null
    } catch (error) {
      console.error("Error al obtener usuario por email:", error)
      throw error
    }
  }

  async createUserIfNotExists(user: Usuario): Promise<Usuario> {
    try {
      if (!user.id) {
        throw new Error("ID de usuario es requerido")
      }

      const existingUser = await this.getById(user.id)

      if (existingUser) {
        return existingUser
      }

      return await this.createWithId(user.id, user)
    } catch (error) {
      console.error("Error al crear usuario si no existe:", error)
      throw error
    }
  }
}

export const usuarioService = new UsuarioService()
