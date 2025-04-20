"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/config"

interface Residente {
  id: string
  nombre: string
  email: string
  cui: string
  dni: string
  especialidad: string
  anioAcademico: string
}

const Residentes = () => {
  const [residentes, setResidentes] = useState<Residente[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  // Form fields
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [cui, setCui] = useState("")
  const [dni, setDni] = useState("")
  const [especialidad, setEspecialidad] = useState("")
  const [anioAcademico, setAnioAcademico] = useState("")

  const especialidades = [
    "Anatomía Patológica",
    "Anestesiología",
    "Cardiología",
    "Cirugía General",
    "Dermatología",
    "Endocrinología",
    "Gastroenterología",
    "Geriatría",
    "Ginecología y Obstetricia",
    "Hematología",
    "Infectología",
    "Medicina Familiar",
    "Medicina Interna",
    "Nefrología",
    "Neumología",
    "Neurología",
    "Oftalmología",
    "Oncología",
    "Ortopedia y Traumatología",
    "Otorrinolaringología",
    "Pediatría",
    "Psiquiatría",
    "Radiología",
    "Reumatología",
    "Urología",
  ]

  useEffect(() => {
    fetchResidentes()
  }, [])

  const fetchResidentes = async () => {
    try {
      setLoading(true)
      const residentesRef = collection(db, "residentes")
      const residentesSnapshot = await getDocs(residentesRef)

      const residentesData: Residente[] = []
      residentesSnapshot.forEach((doc) => {
        residentesData.push({
          id: doc.id,
          ...(doc.data() as Omit<Residente, "id">),
        })
      })

      setResidentes(residentesData)
    } catch (error) {
      console.error("Error al cargar residentes:", error)
      setError("Error al cargar la lista de residentes")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNombre("")
    setEmail("")
    setCui("")
    setDni("")
    setEspecialidad("")
    setAnioAcademico("")
    setEditMode(false)
    setCurrentId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !email || !cui || !dni || !especialidad || !anioAcademico) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Verificar si el email, CUI o DNI ya existen (excepto en edición)
      const emailExists = residentes.some((r) => r.email === email && r.id !== currentId)
      const cuiExists = residentes.some((r) => r.cui === cui && r.id !== currentId)
      const dniExists = residentes.some((r) => r.dni === dni && r.id !== currentId)

      if (emailExists) {
        setError("El correo electrónico ya está registrado")
        return
      }

      if (cuiExists) {
        setError("El CUI ya está registrado")
        return
      }

      if (dniExists) {
        setError("El DNI ya está registrado")
        return
      }

      const residenteData = {
        nombre,
        email,
        cui,
        dni,
        especialidad,
        anioAcademico,
        updatedAt: serverTimestamp(),
      }

      if (editMode && currentId) {
        // Actualizar residente existente
        await setDoc(doc(db, "residentes", currentId), residenteData, { merge: true })
      } else {
        // Crear nuevo residente
        const newResidenteRef = doc(collection(db, "residentes"))
        await setDoc(newResidenteRef, {
          ...residenteData,
          createdAt: serverTimestamp(),
        })
      }

      resetForm()
      await fetchResidentes()

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar residente:", error)
      setError("Error al guardar los datos. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (residente: Residente) => {
    setNombre(residente.nombre)
    setEmail(residente.email)
    setCui(residente.cui)
    setDni(residente.dni)
    setEspecialidad(residente.especialidad)
    setAnioAcademico(residente.anioAcademico)
    setEditMode(true)
    setCurrentId(residente.id)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este residente? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "residentes", id))
      await fetchResidentes()
    } catch (error) {
      console.error("Error al eliminar residente:", error)
      setError("Error al eliminar el residente")
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Residentes</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {editMode ? "Editar Residente" : "Nuevo Residente"}
        </h2>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Residente guardado exitosamente.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Institucional
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="cui" className="block text-sm font-medium text-gray-700 mb-1">
                CUI
              </label>
              <input
                type="text"
                id="cui"
                value={cui}
                onChange={(e) => setCui(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                id="especialidad"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="anioAcademico" className="block text-sm font-medium text-gray-700 mb-1">
                Año Académico
              </label>
              <select
                id="anioAcademico"
                value={anioAcademico}
                onChange={(e) => setAnioAcademico(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar año</option>
                <option value="1">Primer Año</option>
                <option value="2">Segundo Año</option>
                <option value="3">Tercer Año</option>
                <option value="4">Cuarto Año</option>
                <option value="5">Quinto Año</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {editMode && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Guardando..." : editMode ? "Actualizar Residente" : "Guardar Residente"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Lista de Residentes</h2>

        {residentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {residentes.map((residente) => (
                  <tr key={residente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {residente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.cui}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.dni}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.especialidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.anioAcademico}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(residente)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(residente.id)} className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay residentes registrados.</p>
        )}
      </div>
    </div>
  )
}

export default Residentes
