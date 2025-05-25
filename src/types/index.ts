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
  especialidadId: string
  sedeRotacionId: string
  anioIngreso: string
  anioAcademico: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Nota {
  id?: string
  residenteId: string
  docenteId: string
  fecha: Timestamp | Date
  vacaciones: boolean
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
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface ResidenteConNotas extends Residente {
  notas?: Nota[]
}

export interface Sede {
  id?: string
  nombre: string
  direccion: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Especialidad {
  id?: string
  nombre: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Docente {
  id?: string
  apellidosNombres: string
  dni: string
  correoInstitucional: string
  correoPersonal: string
  telefono: string
  sedeId: string
  habilitado: boolean
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}
