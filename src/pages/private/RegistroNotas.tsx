"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useResidentes, useNotas, useDocentes, useEspecialidades } from "../../hooks"

const RegistroNotas = () => {
  const { currentUser } = useAuth()
  const { getAll: getAllResidentes } = useResidentes()
  const { getAll: getAllNotas, create: createNota } = useNotas()
  const { getHabilitados: getDocentes } = useDocentes()
  const { getAllOrdenadas: getEspecialidades } = useEspecialidades()

  const { data: residentes = [], isLoading } = getAllResidentes()
  const { data: docentes = [], isLoading: loadingDocentes } = getDocentes()
  const { data: especialidades = [], isLoading: loadingEspecialidades } = getEspecialidades()
  const {
    query: { data: notas = [], isLoading: loadingNotas },
  } = getAllNotas()

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [residenteId, setResidenteId] = useState("")
  const [docenteId, setDocenteId] = useState("")
  const [fecha, setFecha] = useState("")
  const [vacaciones, setVacaciones] = useState(false)
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

  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId)
    return especialidad ? especialidad.nombre : "Especialidad no encontrada"
  }

  const getResidenteNombre = (residenteId: string) => {
    const residente = residentes.find((r) => r.id === residenteId)
    return residente ? residente.nombre : "Residente no encontrado"
  }

  const getDocenteNombre = (docenteId: string) => {
    const docente = docentes.find((d) => d.id === docenteId)
    return docente ? docente.apellidosNombres : "Docente no encontrado"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!residenteId || !docenteId || !fecha || !hospital || !rotacion) {
      setError("Todos los campos marcados con * son obligatorios")
      return
    }

    if (!vacaciones && (!conocimientos || !habilidades || !aptitudes)) {
      setError("Las notas son obligatorias cuando no está en vacaciones")
      return
    }

    const conocimientosNum = Number.parseFloat(conocimientos)
    const habilidadesNum = Number.parseFloat(habilidades)
    const aptitudesNum = Number.parseFloat(aptitudes)

    if (
      !vacaciones &&
      (isNaN(conocimientosNum) ||
        conocimientosNum < 0 ||
        conocimientosNum > 20 ||
        isNaN(habilidadesNum) ||
        habilidadesNum < 0 ||
        habilidadesNum > 20 ||
        isNaN(aptitudesNum) ||
        aptitudesNum < 0 ||
        aptitudesNum > 20)
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

      const promedio = vacaciones ? 0 : calcularPromedio()

      await createNota.mutateAsync({
        residenteId,
        docenteId,
        fecha: new Date(fecha),
        vacaciones,
        conocimientos: vacaciones ? 0 : conocimientosNum,
        habilidades: vacaciones ? 0 : habilidadesNum,
        aptitudes: vacaciones ? 0 : aptitudesNum,
        promedio,
        observacion,
        responsable: currentUser?.displayName || "Desconocido",
        responsableId: currentUser?.uid || "",
        especialidad: getEspecialidadNombre(residente.especialidadId),
        anioAcademico: residente.anioAcademico,
        hospital,
        rotacion,
      })

      // Resetear formulario
      setResidenteId("")
      setDocenteId("")
      setFecha("")
      setVacaciones(false)
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

  if (isLoading || loadingDocentes || loadingEspecialidades) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registro Mensual</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Nuevo Registro</h2>

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
                    {residente.nombre} - {getEspecialidadNombre(residente.especialidadId)} (Año{" "}
                    {residente.anioAcademico})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="docente" className="block text-sm font-medium text-gray-700 mb-1">
                Docente *
              </label>
              <select
                id="docente"
                value={docenteId}
                onChange={(e) => setDocenteId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Seleccionar docente</option>
                {docentes.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.apellidosNombres}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="vacaciones"
                checked={vacaciones}
                onChange={(e) => setVacaciones(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="vacaciones" className="ml-2 block text-sm text-gray-900">
                Vacaciones
              </label>
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
                  Servicio *
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
                className={`input-field ${vacaciones ? "bg-gray-200 cursor-not-allowed" : ""}`}
                min="0"
                max="20"
                step="0.01"
                disabled={vacaciones}
                required={!vacaciones}
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
                className={`input-field ${vacaciones ? "bg-gray-200 cursor-not-allowed" : ""}`}
                min="0"
                max="20"
                step="0.01"
                disabled={vacaciones}
                required={!vacaciones}
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
                className={`input-field ${vacaciones ? "bg-gray-200 cursor-not-allowed" : ""}`}
                min="0"
                max="20"
                step="0.01"
                disabled={vacaciones}
                required={!vacaciones}
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

      {/* Lista de notas registradas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Registros Mensuales</h2>

        {loadingNotas ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : notas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Residente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conocimientos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habilidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aptitudes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notas.map((nota) => {
                  // Formatear la fecha
                  const fecha =
                    nota.fecha instanceof Date
                      ? nota.fecha.toLocaleDateString()
                      : nota.fecha?.toDate?.().toLocaleDateString() || "Fecha desconocida"

                  return (
                    <tr key={nota.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getResidenteNombre(nota.residenteId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDocenteNombre(nota.docenteId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.hospital}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.rotacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            nota.vacaciones ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {nota.vacaciones ? "Vacaciones" : "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.vacaciones ? "-" : nota.conocimientos.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.vacaciones ? "-" : nota.habilidades.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.vacaciones ? "-" : nota.aptitudes.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {nota.vacaciones ? (
                          <span className="text-gray-500">-</span>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full ${
                              nota.promedio >= 14
                                ? "bg-green-100 text-green-800"
                                : nota.promedio >= 11
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {nota.promedio.toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay registros</h3>
            <p className="mt-1 text-gray-500">No se han registrado evaluaciones aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistroNotas
