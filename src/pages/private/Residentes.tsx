"use client";

import type React from "react";
import { useState } from "react";
import {
  useResidentes,
  useEspecialidades,
  useSedes,
  useNotas,
} from "../../hooks";
import { useProcesosResidentado } from "../../hooks/useProcesosResidentado";
import { getMesNombrePorNumero } from "../../utils/dateUtils";

const Residentes = () => {
  const { getAll, create, update, remove } = useResidentes();
  const { getAll: getEspecialidades } = useEspecialidades();
  const { getAll: getSedes } = useSedes();
  const { getAll: getAllNotas } = useNotas();
  const { getConDetalles } = useProcesosResidentado();

  const { data: residentes = [], isLoading: loadingResidentes } = getAll();
  const { data: especialidades = [], isLoading: loadingEspecialidades } =
    getEspecialidades();
  const { data: sedes = [], isLoading: loadingSedes } = getSedes();
  const {
    query: { data: notas = [], isLoading: loadingNotas },
  } = getAllNotas();
  const { data: procesos = [], isLoading: loadingProcesos } = getConDetalles;

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedResidente, setSelectedResidente] = useState<any>(null);
  const [busqueda, setBusqueda] = useState("");

  // Form fields para residente
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [cui, setCui] = useState("");
  const [dni, setDni] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [sedeRotacionId, setSedeRotacionId] = useState("");
  const [anioIngreso, setAnioIngreso] = useState("");
  const [anioAcademico, setAnioAcademico] = useState("");

  // Años académicos del 1 al 7 y último dato "Egresado"
  const aniosAcademicos = [
    { value: "1", label: "1° Año" },
    { value: "2", label: "2° Año" },
    { value: "3", label: "3° Año" },
    { value: "4", label: "4° Año" },
    { value: "5", label: "5° Año" },
    { value: "6", label: "6° Año" },
    { value: "7", label: "7° Año" },
    { value: "Egresado", label: "Egresado" },
  ];

  const resetForm = () => {
    setNombre("");
    setEmail("");
    setCui("");
    setDni("");
    setEspecialidadId("");
    setSedeRotacionId("");
    setAnioIngreso("");
    setAnioAcademico("");
    setEditMode(false);
    setCurrentId(null);
    setError(null);
  };

  const validateAnioIngreso = (anio: string) => {
    const anioNum = Number.parseInt(anio);
    const currentYear = new Date().getFullYear();

    if (isNaN(anioNum)) {
      return "El año de ingreso debe ser un número válido";
    }

    if (anioNum < 1900 || anioNum > currentYear + 1) {
      return `El año de ingreso debe estar entre 1900 y ${currentYear + 1}`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nombre ||
      !email ||
      !cui ||
      !dni ||
      !especialidadId ||
      !sedeRotacionId ||
      !anioIngreso ||
      !anioAcademico
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Validar año de ingreso
    const anioIngresoError = validateAnioIngreso(anioIngreso);
    if (anioIngresoError) {
      setError(anioIngresoError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Verificar si el email, CUI o DNI ya existen (excepto en edición)
      const emailExists = residentes.some(
        (r) => r.email === email && r.id !== currentId
      );
      const cuiExists = residentes.some(
        (r) => r.cui === cui && r.id !== currentId
      );
      const dniExists = residentes.some(
        (r) => r.dni === dni && r.id !== currentId
      );

      if (emailExists) {
        setError("El correo electrónico ya está registrado");
        return;
      }

      if (cuiExists) {
        setError("El CUI ya está registrado");
        return;
      }

      if (dniExists) {
        setError("El DNI ya está registrado");
        return;
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
      };

      if (editMode && currentId) {
        await update.mutateAsync({
          id: currentId,
          data: residenteData,
        });
      } else {
        await create.mutateAsync(residenteData);
      }

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error al guardar residente:", error);
      setError("Error al guardar los datos. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (residente: any) => {
    setNombre(residente.nombre);
    setEmail(residente.email);
    setCui(residente.cui);
    setDni(residente.dni);
    setEspecialidadId(residente.especialidadId);
    setSedeRotacionId(residente.sedeId); // Cambiar sedeRotacionId por sedeId
    setAnioIngreso(residente.anioIngreso);
    setAnioAcademico(residente.anioAcademico);
    setEditMode(true);
    setCurrentId(residente.id);
    setShowDetails(false);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este residente? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      await remove.mutateAsync(id);
    } catch (error) {
      console.error("Error al eliminar residente:", error);
      setError("Error al eliminar el residente");
    }
  };

  const handleShowDetails = (residente: any) => {
    setSelectedResidente(residente);
    setShowDetails(true);
    resetForm();
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedResidente(null);
  };

  // Funciones para obtener nombres
  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId);
    return especialidad ? especialidad.nombre : "Especialidad no encontrada";
  };

  const getSedeNombre = (sedeId: string) => {
    const sede = sedes.find((s) => s.id === sedeId);
    return sede ? sede.nombre : "Sede no encontrada";
  };

  const getProcesoNombre = (procesoId: string) => {
    const proceso = procesos.find((p) => p.id === procesoId);
    return proceso ? proceso.nombre : "No encontrado";
  };

  const getMesNombre = (numeroMes: number, procesoId: string) => {
    const proceso = procesos.find((p) => p.id === procesoId);
    if (!proceso) return `Mes ${numeroMes}`;

    const fechaInicio =
      proceso.fechaInicio instanceof Date
        ? proceso.fechaInicio
        : proceso.fechaInicio.toDate();

    return getMesNombrePorNumero(numeroMes, fechaInicio);
  };

  // Función para mostrar el año académico con formato
  const getAnioAcademicoDisplay = (anioAcademico: string) => {
    if (anioAcademico === "Egresado") return "Egresado";
    return `${anioAcademico}° Año`;
  };

  // Filtrar residentes
  const residentesFiltrados = residentes.filter(
    (residente) =>
      residente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      residente.cui.toLowerCase().includes(busqueda.toLowerCase()) ||
      residente.dni.toLowerCase().includes(busqueda.toLowerCase()) ||
      residente.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener notas de un residente
  const getNotasResidente = (residenteId: string | undefined) => {
    if (!residenteId) return [];
    return notas
      .filter((nota) => nota.residenteId === residenteId)
      .sort((a, b) => a.mes - b.mes);
  };

  // Calcular promedio general del residente
  const calcularPromedioGeneral = (residenteId: string | undefined) => {
    if (!residenteId) return 0;
    const notasResidente = getNotasResidente(residenteId).filter(
      (nota) => !nota.vacaciones
    );
    if (notasResidente.length === 0) return 0;
    const suma = notasResidente.reduce((acc, nota) => acc + nota.promedio, 0);
    return suma / notasResidente.length;
  };

  // Función para obtener información del estado
  const getEstadoInfo = (nota: any) => {
    if (nota.vacaciones) {
      const tipoAusencia = nota.tipoAusencia || "Vacaciones";
      let clase = "bg-yellow-100 text-yellow-800";

      if (tipoAusencia === "Licencia de Maternidad") {
        clase = "bg-pink-100 text-pink-800";
      } else if (tipoAusencia !== "Vacaciones") {
        clase = "bg-orange-100 text-orange-800";
      }

      return {
        texto: tipoAusencia,
        clase: clase,
      };
    }
    return {
      texto: "Activo",
      clase: "bg-green-100 text-green-800",
    };
  };

  if (
    loadingResidentes ||
    loadingEspecialidades ||
    loadingSedes ||
    loadingProcesos ||
    loadingNotas
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Residentes
        </h1>
        {showDetails && (
          <button onClick={handleCloseDetails} className="btn-secondary">
            ← Volver a la lista
          </button>
        )}
      </div>

      {!showDetails ? (
        <>
          {/* Formulario de registro/edición */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {editMode ? "Editar Residente" : "Nuevo Residente"}
            </h2>

            {success && (
              <div
                className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
                role="alert"
              >
                <p>
                  {editMode
                    ? "Residente actualizado exitosamente."
                    : "Residente registrado exitosamente."}
                </p>
              </div>
            )}

            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="input-field"
                    placeholder="Ej: Dr. Juan Carlos Pérez López"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo Institucional *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="juan.perez@hospital.gob.pe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="cui"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CUI *
                  </label>
                  <input
                    type="text"
                    id="cui"
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    className="input-field"
                    placeholder="1234567890123"
                    maxLength={13}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código Único de Identificación (13 dígitos)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="dni"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    DNI *
                  </label>
                  <input
                    type="text"
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="input-field"
                    placeholder="12345678"
                    maxLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Documento Nacional de Identidad (8 dígitos)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="especialidad"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Especialidad *
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
                  <label
                    htmlFor="sedeRotacion"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sede de Rotación *
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
                  <label
                    htmlFor="anioIngreso"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Año de Ingreso *
                  </label>
                  <input
                    type="number"
                    id="anioIngreso"
                    value={anioIngreso}
                    onChange={(e) => setAnioIngreso(e.target.value)}
                    className="input-field"
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Año de ingreso a la residencia
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="anioAcademico"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Año Académico *
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
                      <option key={anio.value} value={anio.value}>
                        {anio.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || create.isPending || update.isPending}
                >
                  {submitting || create.isPending || update.isPending
                    ? "Guardando..."
                    : editMode
                    ? "Actualizar Residente"
                    : "Registrar Residente"}
                </button>
              </div>
            </form>
          </div>

          {/* Barra de búsqueda y lista */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Lista de Residentes
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, CUI, DNI o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="input-field pl-10 w-80"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-500">
                  {residentesFiltrados.length} de {residentes.length} residentes
                </div>
              </div>
            </div>

            {residentesFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Residente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Identificación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año Académico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluaciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {residentesFiltrados.map((residente) => {
                      const notasResidente = getNotasResidente(residente.id);
                      const promedioGeneral = calcularPromedioGeneral(
                        residente.id
                      );

                      return (
                        <tr key={residente.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {residente.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {residente.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              CUI: {residente.cui}
                            </div>
                            <div className="text-sm text-gray-500">
                              DNI: {residente.dni}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getEspecialidadNombre(residente.especialidadId)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getSedeNombre(residente.sedeRotacionId)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {getAnioAcademicoDisplay(residente.anioAcademico)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {notasResidente.length} evaluaciones
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {promedioGeneral > 0 ? (
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  promedioGeneral >= 14
                                    ? "bg-green-100 text-green-800"
                                    : promedioGeneral >= 11
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {promedioGeneral.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Sin evaluaciones
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleShowDetails(residente)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(residente)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Editar"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(residente.id!)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {busqueda
                    ? "No se encontraron residentes"
                    : "No hay residentes registrados"}
                </h3>
                <p className="mt-1 text-gray-500">
                  {busqueda
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza registrando el primer residente"}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Vista de detalles del residente
        <div className="space-y-6">
          {selectedResidente && (
            <>
              {/* Información personal */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Información Personal
                  </h3>
                  <button
                    onClick={() => handleEdit(selectedResidente)}
                    className="btn-secondary"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre Completo
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedResidente.nombre}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Correo Institucional
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedResidente.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CUI
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedResidente.cui}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      DNI
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedResidente.dni}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Especialidad
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getEspecialidadNombre(selectedResidente.especialidadId)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sede de Rotación
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getSedeNombre(selectedResidente.sedeId)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Año de Ingreso
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedResidente.anioIngreso}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Año Académico
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getAnioAcademicoDisplay(selectedResidente.anioAcademico)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen de calificaciones */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Resumen de Evaluaciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700">
                      Total Evaluaciones
                    </h4>
                    <p className="text-2xl font-bold text-blue-900">
                      {getNotasResidente(selectedResidente.id).length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700">
                      Evaluaciones Activas
                    </h4>
                    <p className="text-2xl font-bold text-green-900">
                      {
                        getNotasResidente(selectedResidente.id).filter(
                          (nota) => !nota.vacaciones
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-700">
                      Ausencias
                    </h4>
                    <p className="text-2xl font-bold text-yellow-900">
                      {
                        getNotasResidente(selectedResidente.id).filter(
                          (nota) => nota.vacaciones
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700">
                      Promedio General
                    </h4>
                    <p className="text-2xl font-bold text-purple-900">
                      {calcularPromedioGeneral(selectedResidente.id).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historial de notas */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Historial de Evaluaciones
                </h3>
                {getNotasResidente(selectedResidente.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proceso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hospital
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Servicio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Encargado
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
                        {getNotasResidente(selectedResidente.id).map((nota) => {
                          const estadoInfo = getEstadoInfo(nota);

                          return (
                            <tr key={nota.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getProcesoNombre(nota.procesoId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getMesNombre(nota.mes, nota.procesoId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {nota.hospital}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {nota.rotacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {nota.encargadoEvaluacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${estadoInfo.clase}`}
                                >
                                  {estadoInfo.texto}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nota.vacaciones
                                  ? "-"
                                  : nota.conocimientos.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nota.vacaciones
                                  ? "-"
                                  : nota.habilidades.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nota.vacaciones
                                  ? "-"
                                  : nota.aptitudes.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {nota.vacaciones ? (
                                  <span className="text-gray-500">-</span>
                                ) : (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
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
                          );
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
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No hay evaluaciones
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Este residente no tiene evaluaciones registradas.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Residentes;
