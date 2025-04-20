"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "../../firebase/config"

interface Administrador {
  id: string
  nombre: string
  email: string
  photoURL?: string
  createdAt: any
}

const Administradores = () => {
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetchAdministradores()
  }, [])

  const fetchAdministradores = async () => {
    try {
      setLoading(true)
      const adminsRef = collection(db, "administradores")
      const adminsSnapshot = await getDocs(adminsRef)

      const adminsData: Administrador[] = []

      for (const adminDoc of adminsSnapshot.docs) {
        // Obtener información del usuario
        const userId = adminDoc.id
        const userDoc = await getDocs(query(collection(db, "usuarios"), where("__name__", "==", userId)))

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()

          adminsData.push({
            id: userId,
            nombre: userData.nombre || "Sin nombre",
            email: userData.email || "Sin email",
            photoURL: userData.photoURL,
            createdAt: adminDoc.data().createdAt?.toDate?.() || new Date(),
          })
        } else {
          // Si no hay información de usuario, mostrar solo el ID
          adminsData.push({
            id: userId,
            nombre: "Usuario desconocido",
            email: "Sin email",
            createdAt: adminDoc.data().createdAt?.toDate?.() || new Date(),
          })
        }
      }

      setAdministradores(adminsData)
    } catch (error) {
      console.error("Error al cargar administradores:", error)
      setError("Error al cargar la lista de administradores")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("El correo electrónico es obligatorio")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Buscar el usuario por email
      const usuariosRef = collection(db, "usuarios")
      const q = query(usuariosRef, where("email", "==", email))
      const usuariosSnapshot = await getDocs(q)

      if (usuariosSnapshot.empty) {
        setError(
          "No se encontró ningún usuario con ese correo electrónico. El usuario debe iniciar sesión al menos una vez antes de ser asignado como administrador.",
        )
        return
      }

      const userId = usuariosSnapshot.docs[0].id

      // Verificar si ya es administrador
      const adminDoc = await getDocs(query(collection(db, "administradores"), where("__name__", "==", userId)))

      if (!adminDoc.empty) {
        setError("Este usuario ya es administrador")
        return
      }

      // Agregar como administrador
      const adminRef = doc(db, "administradores", userId)
      await setDoc(adminRef, {
        createdAt: new Date(),
      })

      setEmail("")
      await fetchAdministradores()

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error al agregar administrador:", error)
      setError("Error al agregar el administrador. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este administrador? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "administradores", id))
      await fetchAdministradores()
    } catch (error) {
      console.error("Error al eliminar administrador:", error)
      setError("Error al eliminar el administrador")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Administradores</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Nuevo Administrador</h2>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Administrador agregado exitosamente.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico del Usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="ejemplo@gmail.com"
              required
            />
          </div>

          <div className="self-end">
            <button type="submit" className="btn-primary h-10" disabled={submitting}>
              {submitting ? "Agregando..." : "Agregar Administrador"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Nota: El usuario debe haber iniciado sesión al menos una vez en el sistema antes de poder ser asignado como
            administrador.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Lista de Administradores</h2>

        {administradores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Asignación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {administradores.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.photoURL ? (
                          <img
                            src={admin.photoURL || "/placeholder.svg"}
                            alt={admin.nombre}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white mr-3">
                            {admin.nombre[0].toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{admin.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.createdAt instanceof Date ? admin.createdAt.toLocaleDateString() : "Fecha desconocida"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay administradores registrados.</p>
        )}
      </div>
    </div>
  )
}

export default Administradores
