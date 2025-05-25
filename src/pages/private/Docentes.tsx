"use client"

import type React from "react"
import { useState } from "react"
import { useDocentes, useSedes } from "../../hooks"

const Docentes = () => {
  const { getAll, create, update, remove } = useDocentes()
  const { getAllOrdenadas } = useSedes()

  const { data: docentes = [], isLoading } = getAll()
  const { data: sedes = [], isLoading: loadingSedes } = getAllOrdenadas()

  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [apellidosNombres, setApellidosNombres] = useState("")
  const [dni, setDni] = useState("")
  const [correoInstitucional, setCorreoInstitucional] = useState("")
  const [correoPersonal, setCorreoPersonal] = useState("")
  const [telefono, setTelefono] = useState("")
  const [sedeId, setSedeId] = useState("")
  const [habilitado, setHabilitado] = useState(true)

  const resetForm = () => {
    setApellidosNombres("")
    setDni("")
    setCorreoInstitucional("")
    setCorreoPersonal("")
    setTelefono("")
    setSedeId("")
    setHabilitado(true)
    setEditMode(false)
    setCurrentId(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apellidosNombres.trim() || !dni.trim() || !correoInstitucional.trim() || !sedeId) {
      setError("Los campos de apellidos y nombres, DNI, correo institucional y sede son obligatorios")
      return
    }

    // Verificar DNI duplicado
    const dniExists = docentes.some((d) => d.dni === dni.trim() && (editMode ? d.id !== currentId : true))

    if (dniExists) {
      setError("Ya existe un docente con este DNI")
      return
    }

    try {
      setError(null)

      const docenteData = {
        apellidosNombres: apellidosNombres.trim(),
        dni: dni.trim(),
        correoInstitucional: correoInstitucional.trim(),
        correoPersonal: correoPersonal.trim(),
        telefono: telefono.trim(),
        sedeId,
        habilitado,
      }

      if (editMode && currentId) {
        await update.mutateAsync({
          id: currentId,
          data: docenteData,
        })
      } else {
        await create.mutateAsync(docenteData)
      }

      resetForm()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar docente:", error)
      setError("Error al guardar el docente. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (docente: any) => {
    setApellidosNombres(docente.apellidosNombres)
    setDni(docente.dni)
    setCorreoInstitucional(docente.correoInstitucional)
    setCorreoPersonal(docente.correoPersonal)
    setTelefono(docente.telefono)
    setSedeId(docente.sedeId)
    setHabilitado(docente.habilitado)
    setEditMode(true)
    setCurrentId(docente.id)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este docente? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await remove.mutateAsync(id)
    } catch (error) {
      console.error("Error al eliminar docente:", error)
      setError("Error al eliminar el docente")
    }
  }

  // Función para obtener el nombre de la sede
  const getSedeNombre = (sedeId: string) => {
    const sede = sedes.find((s) => s.id === sedeId)
    return sede ? sede.nombre : "Sede no encontrada"
  }

  if (isLoading || loadingSedes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Docentes</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{editMode ? "Editar Docente" : "Nuevo Docente"}</h2>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Docente guardado exitosamente.</p>
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
              <label htmlFor="apellidosNombres" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos y Nombres *
              </label>
              <input
                type="text"
                id="apellidosNombres"
                value={apellidosNombres}
                onChange={(e) => setApellidosNombres(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI *
              </label>
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="input-field"
                maxLength={8}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="correoInstitucional" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Institucional *
              </label>
              <input
                type="email"
                id="correoInstitucional"
                value={correoInstitucional}
                onChange={(e) => setCorreoInstitucional(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="correoPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Personal
              </label>
              <input
                type="email"
                id="correoPersonal"
                value={correoPersonal}
                onChange={(e) => setCorreoPersonal(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="sede" className="block text-sm font-medium text-gray-700 mb-1">
                Sede *
              </label>
              <select
                id="sede"
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar sede</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="habilitado"
                checked={habilitado}
                onChange={(e) => setHabilitado(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="habilitado" className="ml-2 block text-sm text-gray-900">
                Docente habilitado para registro de notas
              </label>
            </div>
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
                  ? "Actualizar Docente"
                  : "Guardar Docente"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Lista de Docentes</h2>

        {docentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apellidos y Nombres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Institucional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {docentes.map((docente) => (
                  <tr key={docente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {docente.apellidosNombres}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{docente.dni}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{docente.correoInstitucional}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSedeNombre(docente.sedeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{docente.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          docente.habilitado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {docente.habilitado ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(docente)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(docente.id!)} className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay docentes registrados.</p>
        )}
      </div>
    </div>
  )
}

export default Docentes
