import type { Timestamp } from "firebase/firestore";

export interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  photoURL?: string;
  adminStatus?: "activo" | "pendiente";
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Administrador {
  id?: string;
  email?: string;
  activo?: boolean;
  createdAt?: Timestamp | Date;
  activatedAt?: Timestamp | Date;
}

export interface Residente {
  id?: string;
  nombre: string;
  email: string;
  cui: string;
  dni: string;
  especialidadId: string;
  sedeRotacionId: string;
  anioIngreso: string;
  anioAcademico: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Nuevo: Proceso de Residentado
export interface ProcesoResidentado {
  id?: string;
  nombre: string;
  descripcion?: string;
  anioAcademico: string;
  fechaInicio: Timestamp | Date;
  fechaFin: Timestamp | Date;
  duracionMeses: number;
  activo: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Nuevo: Inscripción de residente a un proceso
export interface InscripcionProceso {
  id?: string;
  procesoId: string;
  residenteId: string;
  fechaInscripcion: Timestamp | Date;
  activo: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Nota {
  id?: string;
  procesoId: string; // Nuevo: vinculado al proceso
  residenteId: string;
  mes: number; // Nuevo: mes del proceso (1-12)
  encargadoEvaluacion: string;
  vacaciones: boolean;
  tipoAusencia?: string;
  conocimientos: number;
  habilidades: number;
  aptitudes: number;
  promedio: number;
  observacion: string;
  responsable: string;
  responsableId: string;
  especialidad: string;
  anioAcademico: string;
  hospital: string;
  rotacion: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface ResidenteConNotas extends Residente {
  notas?: Nota[];
}

export interface Sede {
  id?: string;
  nombre: string;
  direccion: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Especialidad {
  id?: string;
  nombre: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Nuevos tipos para vistas combinadas
export interface ProcesoConDetalles extends ProcesoResidentado {
  totalInscritos?: number;
}

export interface InscripcionConDetalles extends InscripcionProceso {
  residenteNombre?: string;
  procesoNombre?: string;
}
