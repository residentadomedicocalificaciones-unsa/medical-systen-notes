import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "../firebase/config"

export class BaseService<T extends { id?: string }> {
  protected collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  protected getCollection() {
    return collection(db, this.collectionName)
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id)
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(this.getCollection(), ...constraints)
      const querySnapshot = await getDocs(q)

      const items: T[] = []
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data(),
        } as T)
      })

      return items
    } catch (error) {
      console.error(`Error al obtener ${this.collectionName}:`, error)
      throw error
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T
      }

      return null
    } catch (error) {
      console.error(`Error al obtener ${this.collectionName} por ID:`, error)
      throw error
    }
  }

  async create(data: Omit<T, "id">): Promise<T> {
    try {
      const docRef = await addDoc(this.getCollection(), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        id: docRef.id,
        ...data,
      } as T
    } catch (error) {
      console.error(`Error al crear ${this.collectionName}:`, error)
      throw error
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = this.getDocRef(id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error al actualizar ${this.collectionName}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error al eliminar ${this.collectionName}:`, error)
      throw error
    }
  }

  async createWithId(id: string, data: Omit<T, "id">): Promise<T> {
    try {
      const docRef = this.getDocRef(id)
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        id,
        ...data,
      } as T
    } catch (error) {
      console.error(`Error al crear ${this.collectionName} con ID:`, error)
      throw error
    }
  }

  async exists(field: string, value: any): Promise<boolean> {
    try {
      const q = query(this.getCollection(), where(field, "==", value), limit(1))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error(`Error al verificar existencia en ${this.collectionName}:`, error)
      throw error
    }
  }
}
