"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/config"
import { useEspecialidades, useSedes, useNotas, useDocentes } from "../../hooks"

interface Residente {
  id: string
  nombre: string
  email: string
  cui: string
  dni: string
  especialidadId: string
  sedeRotacionId: string
  anioIngreso: string
  anioAcademico: string
}

const Residentes = () => {
  const { getAllOrdenadas: getEspecialidades } = useEspecialidades()
  const { getAllOrdenadas: getSedes } = useSedes()
  const { getByResidenteId } = useNotas()
  const { getHabilitados: getDocentes } = useDocentes()

  const { data: especialidades = [], isLoading: loadingEspecialidades } = getEspecialidades()
  const { data: sedes = [], isLoading: loadingSedes } = getSedes()
  const { data: docentes = [], isLoading: loadingDocentes } = getDocentes()

  const [residentes, setResidentes] = useState<Residente[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedResidente, setSelectedResidente] = useState<Residente | null>(null)

  // Form fields
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [cui, setCui] = useState("")
  const [dni, setDni] = useState("")
  const [especialidadId, setEspecialidadId] = useState("")
  const [sedeRotacionId, setSedeRotacionId] = useState("")
  const [anioIngreso, setAnioIngreso] = useState("")
  const [anioAcademico, setAnioAcademico] = useState("")

  // Años académicos del 1 al 10
  const aniosAcademicos = Array.from({ length: 10 }, (_, i) => (i + 1).toString())

  // Hook para obtener notas del residente seleccionado
  const {
    query: { data: notasResidente = [], isLoading: loadingNotasResidente },
  } = getByResidenteId(selectedResidente?.id)

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
    setEspecialidadId("")
    setSedeRotacionId("")
    setAnioIngreso("")
    setAnioAcademico("")
    setEditMode(false)
    setCurrentId(null)
  }

  const validateAnioIngreso = (anio: string) => {
    const anioNum = Number.parseInt(anio)
    const currentYear = new Date().getFullYear()

    if (isNaN(anioNum)) {
      return "El año de ingreso debe ser un número válido"
    }

    if (anioNum < 1900 || anioNum > currentYear + 1) {
      return `El año de ingreso debe estar entre 1900 y ${currentYear + 1}`
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !email || !cui || !dni || !especialidadId || !sedeRotacionId || !anioIngreso || !anioAcademico) {
      setError("Todos los campos son obligatorios")
      return
    }

    // Validar año de ingreso
    const anioIngresoError = validateAnioIngreso(anioIngreso)
    if (anioIngresoError) {
      setError(anioIngresoError)
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
        especialidadId,
        sedeRotacionId,
        anioIngreso,
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
    setEspecialidadId(residente.especialidadId)
    setSedeRotacionId(residente.sedeRotacionId)
    setAnioIngreso(residente.anioIngreso)
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

  const handleShowDetails = (residente: Residente) => {
    setSelectedResidente(residente)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedResidente(null)
  }

  // Funciones para obtener nombres
  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId)
    return especialidad ? especialidad.nombre : "Especialidad no encontrada"
  }

  const getSedeNombre = (sedeId: string) => {
    const sede = sedes.find((s) => s.id === sedeId)
    return sede ? sede.nombre : "Sede no encontrada"
  }

  const getDocenteNombre = (docenteId: string) => {
    const docente = docentes.find((d) => d.id === docenteId)
    return docente ? docente.apellidosNombres : "Docente no encontrado"
  }

  // Calcular promedio general del residente
  const calcularPromedioGeneral = () => {
    if (notasResidente.length === 0) return 0
    const notasConPromedio = notasResidente.filter((nota) => !nota.vacaciones)
    if (notasConPromedio.length === 0) return 0
    const suma = notasConPromedio.reduce((acc, nota) => acc + nota.promedio, 0)
    return suma / notasConPromedio.length
  }

  if (loading || loadingEspecialidades || loadingSedes || loadingDocentes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Residentes</h1>

      {!showDetails ? (
        <>
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
                    value={especialidadId}
                    onChange={(e) => setEspecialidadId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sedeRotacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Sede de Rotación
                  </label>
                  <select
                    id="sedeRotacion"
                    value={sedeRotacionId}
                    onChange={(e) => setSedeRotacionId(e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="anioIngreso" className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Ingreso
                  </label>
                  <input
                    type="number"
                    id="anioIngreso"
                    value={anioIngreso}
                    onChange={(e) => setAnioIngreso(e.target.value)}
                    className="input-field"
                    placeholder="Ej: 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Ingrese el año de ingreso a la residencia (ej: 2020)</p>
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
                    <option value="">Seleccionar año académico</option>
                    {aniosAcademicos.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}° Año
                      </option>
                    ))}
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
                        Sede Rotación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año Ingreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año Académico
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getEspecialidadNombre(residente.especialidadId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getSedeNombre(residente.sedeRotacionId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residente.anioIngreso}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {residente.anioAcademico}°
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleShowDetails(residente)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Detalles
                          </button>
                          <button
                            onClick={() => handleEdit(residente)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(residente.id)}
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
              <p className="text-gray-500">No hay residentes registrados.</p>
            )}
          </div>
        </>
      ) : (
        // Vista de detalles del residente
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Detalles del Residente</h2>
            <button onClick={handleCloseDetails} className="btn-secondary">
              Volver a la lista
            </button>
          </div>

          {selectedResidente && (
            <>
              {/* Información personal */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Correo Institucional</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CUI</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.cui}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DNI</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.dni}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getEspecialidadNombre(selectedResidente.especialidadId)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sede de Rotación</label>
                    <p className="mt-1 text-sm text-gray-900">{getSedeNombre(selectedResidente.sedeRotacionId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Año de Ingreso</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.anioIngreso}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Año Académico</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResidente.anioAcademico}° Año</p>
                  </div>
                </div>
              </div>

              {/* Resumen de calificaciones */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Calificaciones</h3>
                {loadingNotasResidente ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700">Total Evaluaciones</h4>
                      <p className="text-2xl font-bold text-blue-900">{notasResidente.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-700">Evaluaciones Activas</h4>
                      <p className="text-2xl font-bold text-green-900">
                        {notasResidente.filter((nota) => !nota.vacaciones).length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-700">Vacaciones</h4>
                      <p className="text-2xl font-bold text-yellow-900">
                        {notasResidente.filter((nota) => nota.vacaciones).length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-700">Promedio General</h4>
                      <p className="text-2xl font-bold text-purple-900">{calcularPromedioGeneral().toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de notas */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Historial de Evaluaciones</h3>
                {loadingNotasResidente ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : notasResidente.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Docente
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Observaciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {notasResidente.map((nota) => {
                          const fecha =
                            nota.fecha instanceof Date
                              ? nota.fecha.toLocaleDateString()
                              : nota.fecha?.toDate?.().toLocaleDateString() || "Fecha desconocida"

                          return (
                            <tr key={nota.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fecha}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.hospital}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.rotacion}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getDocenteNombre(nota.docenteId)}
                              </td>
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
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                {nota.observacion || "-"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No hay evaluaciones</h3>
                    <p className="mt-1 text-gray-500">Este residente no tiene evaluaciones registradas.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Residentes
