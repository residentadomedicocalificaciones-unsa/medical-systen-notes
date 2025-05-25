"use client"

import type React from "react"
import { useState } from "react"
import { useEspecialidades } from "../../hooks"

const Especialidades = () => {
  const { getAll, create, update, remove } = useEspecialidades()
  const { data: especialidades = [], isLoading } = getAll()

  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [nombre, setNombre] = useState("")

  const resetForm = () => {
    setNombre("")
    setEditMode(false)
    setCurrentId(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      setError("El nombre de la especialidad es obligatorio")
      return
    }

    try {
      setError(null)

      if (editMode && currentId) {
        await update.mutateAsync({
          id: currentId,
          data: { nombre: nombre.trim() },
        })
      } else {
        await create.mutateAsync({
          nombre: nombre.trim(),
        })
      }

      resetForm()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar especialidad:", error)
      setError("Error al guardar la especialidad. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (especialidad: any) => {
    setNombre(especialidad.nombre)
    setEditMode(true)
    setCurrentId(especialidad.id)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta especialidad? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await remove.mutateAsync(id)
    } catch (error) {
      console.error("Error al eliminar especialidad:", error)
      setError("Error al eliminar la especialidad")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Especialidades</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {editMode ? "Editar Especialidad" : "Nueva Especialidad"}
        </h2>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Especialidad guardada exitosamente.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Especialidad
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field max-w-md"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            {editMode && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending
                ? "Guardando..."
                : editMode
                  ? "Actualizar Especialidad"
                  : "Guardar Especialidad"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Lista de Especialidades</h2>

        {especialidades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {especialidades.map((especialidad) => (
                  <tr key={especialidad.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {especialidad.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(especialidad)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(especialidad.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay especialidades registradas.</p>
        )}
      </div>
    </div>
  )
}

export default Especialidades
