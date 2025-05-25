import { query, where, getDocs, orderBy } from "firebase/firestore"
import type { Residente, ResidenteConNotas } from "../types"
import { BaseService } from "./base.service"
import { notaService } from "./nota.service"

class ResidenteService extends BaseService<Residente> {
  constructor() {
    super("residentes")
  }

  async getByCredentials(email: string, cui: string, dni: string): Promise<Residente | null> {
    try {
      const queryObj = query(
        this.getCollection(),
        where("email", "==", email),
        where("cui", "==", cui),
        where("dni", "==", dni),
      )
      const querySnapshot = await getDocs(queryObj)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data(),
        } as Residente
      }

      return null
    } catch (error) {
      console.error("Error al obtener residente por credenciales:", error)
      throw error
    }
  }

  async getByEspecialidadId(especialidadId: string): Promise<Residente[]> {
    try {
      return this.getAll([where("especialidadId", "==", especialidadId), orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener residentes por especialidad:", error)
      throw error
    }
  }

  async getBySedeRotacion(sedeRotacionId: string): Promise<Residente[]> {
    try {
      return this.getAll([where("sedeRotacionId", "==", sedeRotacionId), orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener residentes por sede de rotación:", error)
      throw error
    }
  }

  async getByAnioAcademico(anio: string): Promise<Residente[]> {
    try {
      return this.getAll([where("anioAcademico", "==", anio), orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener residentes por año académico:", error)
      throw error
    }
  }

  async getByAnioIngreso(anio: string): Promise<Residente[]> {
    try {
      return this.getAll([where("anioIngreso", "==", anio), orderBy("nombre")])
    } catch (error) {
      console.error("Error al obtener residentes por año de ingreso:", error)
      throw error
    }
  }

  async getResidenteConNotas(residenteId: string): Promise<ResidenteConNotas | null> {
    try {
      const residente = await this.getById(residenteId)

      if (!residente) {
        return null
      }

      const notas = await notaService.getByResidenteId(residenteId)

      return {
        ...residente,
        notas,
      }
    } catch (error) {
      console.error("Error al obtener residente con notas:", error)
      throw error
    }
  }

  async checkDuplicates(
    email: string,
    cui: string,
    dni: string,
    excludeId?: string,
  ): Promise<{ field: string; isDuplicate: boolean } | null> {
    try {
      // Verificar email duplicado
      const emailQuery = query(this.getCollection(), where("email", "==", email))
      const emailSnapshot = await getDocs(emailQuery)

      if (!emailSnapshot.empty && (excludeId === undefined || emailSnapshot.docs[0].id !== excludeId)) {
        return { field: "email", isDuplicate: true }
      }

      // Verificar CUI duplicado
      const cuiQuery = query(this.getCollection(), where("cui", "==", cui))
      const cuiSnapshot = await getDocs(cuiQuery)

      if (!cuiSnapshot.empty && (excludeId === undefined || cuiSnapshot.docs[0].id !== excludeId)) {
        return { field: "cui", isDuplicate: true }
      }

      // Verificar DNI duplicado
      const dniQuery = query(this.getCollection(), where("dni", "==", dni))
      const dniSnapshot = await getDocs(dniQuery)

      if (!dniSnapshot.empty && (excludeId === undefined || dniSnapshot.docs[0].id !== excludeId)) {
        return { field: "dni", isDuplicate: true }
      }

      return null
    } catch (error) {
      console.error("Error al verificar duplicados:", error)
      throw error
    }
  }
}

export const residenteService = new ResidenteService()
