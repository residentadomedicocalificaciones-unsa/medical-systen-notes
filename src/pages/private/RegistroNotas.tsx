"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useResidentes, useNotas } from "../../hooks"

const RegistroNotas = () => {
  const { currentUser } = useAuth()
  const { getAll: getAllResidentes } = useResidentes()
  const { create: createNota } = useNotas()

  const { data: residentes = [], isLoading } = getAllResidentes()

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [residenteId, setResidenteId] = useState("")
  const [conocimientos, setConocimientos] = useState("")
  const [habilidades, setHabilidades] = useState("")
  const [aptitudes, setAptitudes] = useState("")
  const [observacion, setObservacion] = useState("")
  const [hospital, setHospital] = useState("")
  const [rotacion, setRotacion] = useState("")

  const calcularPromedio = () => {
    const conocimientosNum = Number.parseFloat(conocimientos) || 0
    const habilidadesNum = Number.parseFloat(habilidades) || 0
    const aptitudesNum = Number.parseFloat(aptitudes) || 0

    return (conocimientosNum + habilidadesNum + aptitudesNum) / 3
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!residenteId || !conocimientos || !habilidades || !aptitudes || !hospital || !rotacion) {
      setError("Todos los campos marcados con * son obligatorios")
      return
    }

    const conocimientosNum = Number.parseFloat(conocimientos)
    const habilidadesNum = Number.parseFloat(habilidades)
    const aptitudesNum = Number.parseFloat(aptitudes)

    if (
      isNaN(conocimientosNum) ||
      conocimientosNum < 0 ||
      conocimientosNum > 20 ||
      isNaN(habilidadesNum) ||
      habilidadesNum < 0 ||
      habilidadesNum > 20 ||
      isNaN(aptitudesNum) ||
      aptitudesNum < 0 ||
      aptitudesNum > 20
    ) {
      setError("Las notas deben ser valores numéricos entre 0 y 20")
      return
    }

    try {
      setError(null)

      const residente = residentes.find((r) => r.id === residenteId)

      if (!residente) {
        setError("Residente no encontrado")
        return
      }

      const promedio = calcularPromedio()

      await createNota.mutateAsync({
        residenteId,
        conocimientos: conocimientosNum,
        habilidades: habilidadesNum,
        aptitudes: aptitudesNum,
        promedio,
        observacion,
        responsable: currentUser?.displayName || "Desconocido",
        responsableId: currentUser?.uid || "",
        especialidad: residente.especialidad,
        anioAcademico: residente.anioAcademico,
        hospital,
        rotacion,
        fecha: new Date(),
      })

      // Resetear formulario
      setResidenteId("")
      setConocimientos("")
      setHabilidades("")
      setAptitudes("")
      setObservacion("")
      setHospital("")
      setRotacion("")

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error al registrar nota:", error)
      setError("Error al registrar la nota. Inténtalo de nuevo.")
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registro de Notas</h1>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Nueva Evaluación</h2>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Nota registrada exitosamente.</p>
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
              <label htmlFor="residente" className="block text-sm font-medium text-gray-700 mb-1">
                Residente *
              </label>
              <select
                id="residente"
                value={residenteId}
                onChange={(e) => setResidenteId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar residente</option>
                {residentes.map((residente) => (
                  <option key={residente.id} value={residente.id}>
                    {residente.nombre} - {residente.especialidad} (Año {residente.anioAcademico})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital *
                </label>
                <input
                  type="text"
                  id="hospital"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="rotacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Rotación/Servicio *
                </label>
                <input
                  type="text"
                  id="rotacion"
                  value={rotacion}
                  onChange={(e) => setRotacion(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="conocimientos" className="block text-sm font-medium text-gray-700 mb-1">
                Conocimientos (0-20) *
              </label>
              <input
                type="number"
                id="conocimientos"
                value={conocimientos}
                onChange={(e) => setConocimientos(e.target.value)}
                className="input-field"
                min="0"
                max="20"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="habilidades" className="block text-sm font-medium text-gray-700 mb-1">
                Habilidades (0-20) *
              </label>
              <input
                type="number"
                id="habilidades"
                value={habilidades}
                onChange={(e) => setHabilidades(e.target.value)}
                className="input-field"
                min="0"
                max="20"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="aptitudes" className="block text-sm font-medium text-gray-700 mb-1">
                Aptitudes (0-20) *
              </label>
              <input
                type="number"
                id="aptitudes"
                value={aptitudes}
                onChange={(e) => setAptitudes(e.target.value)}
                className="input-field"
                min="0"
                max="20"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="observacion" className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="input-field"
              rows={4}
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">* Campos obligatorios</span>
            </div>

            <div className="flex items-center">
              <span className="mr-4 font-medium">
                Promedio: <span className="text-lg">{calcularPromedio().toFixed(2)}</span>
              </span>

              <button type="submit" className="btn-primary" disabled={createNota.isPending}>
                {createNota.isPending ? "Guardando..." : "Guardar Evaluación"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistroNotas
