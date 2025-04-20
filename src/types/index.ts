import type { Timestamp } from "firebase/firestore"

export interface Usuario {
  id?: string
  nombre: string
  email: string
  photoURL?: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Administrador {
  id?: string
  createdAt?: Timestamp | Date
}

export interface Residente {
  id?: string
  nombre: string
  email: string
  cui: string
  dni: string
  especialidad: string
  anioAcademico: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Nota {
  id?: string
  residenteId: string
  conocimientos: number
  habilidades: number
  aptitudes: number
  promedio: number
  observacion: string
  responsable: string
  responsableId: string
  especialidad: string
  anioAcademico: string
  hospital: string
  rotacion: string
  fecha?: Timestamp | Date
}

export interface ResidenteConNotas extends Residente {
  notas?: Nota[]
}
