import type { Administrador, Usuario } from "../types"
import { BaseService } from "./base.service"
import { usuarioService } from "./usuario.service"

class AdministradorService extends BaseService<Administrador> {
  constructor() {
    super("administradores")
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const adminDoc = await this.getById(userId)
      return adminDoc !== null
    } catch (error) {
      console.error("Error al verificar si es administrador:", error)
      return false
    }
  }

  async getAllAdminsWithDetails(): Promise<Usuario[]> {
    try {
      const admins = await this.getAll()
      const adminUsers: Usuario[] = []

      for (const admin of admins) {
        if (admin.id) {
          const user = await usuarioService.getById(admin.id)
          if (user) {
            adminUsers.push(user)
          }
        }
      }

      return adminUsers
    } catch (error) {
      console.error("Error al obtener administradores con detalles:", error)
      throw error
    }
  }

  async addAdmin(email: string): Promise<boolean> {
    try {
      const user = await usuarioService.getByEmail(email)

      if (!user || !user.id) {
        throw new Error("Usuario no encontrado")
      }

      const isAlreadyAdmin = await this.isAdmin(user.id)

      if (isAlreadyAdmin) {
        throw new Error("El usuario ya es administrador")
      }

      await this.createWithId(user.id, {
        createdAt: new Date(),
      })

      return true
    } catch (error) {
      console.error("Error al agregar administrador:", error)
      throw error
    }
  }
}

export const administradorService = new AdministradorService()
