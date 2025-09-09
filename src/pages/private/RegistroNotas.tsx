"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useResidentes, useNotas, useEspecialidades } from "../../hooks";
import { useProcesosResidentado } from "../../hooks/useProcesosResidentado";
import { useInscripcionesProceso } from "../../hooks/useInscripcionesProceso";
import { useSeguimientoNotas } from "../../hooks/useSeguimientoNotas";
import { getMesesProceso, getMesNombrePorNumero } from "../../utils/dateUtils";
import SeguimientoNotas from "../../components/SeguimientoNotas";

const RegistroNotas = () => {
  const { currentUser } = useAuth();
  const { getAll: getAllResidentes } = useResidentes();
  const { getAll: getAllNotas, create: createNota } = useNotas();
  const { getAll: getEspecialidades } = useEspecialidades();
  const { getConDetalles } = useProcesosResidentado();
  const { useGetInscripcionesConDetalles } = useInscripcionesProceso();
  const { useValidarNotaExistente, useResumenNotasResidente } =
    useSeguimientoNotas();

  const { data: residentes = [], isLoading: loadingResidentes } =
    getAllResidentes();
  const { data: especialidades = [], isLoading: loadingEspecialidades } =
    getEspecialidades();
  const { data: procesos = [], isLoading: loadingProcesos } = getConDetalles;
  const {
    query: { data: notas = [], isLoading: loadingNotas },
  } = getAllNotas();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<"registro" | "seguimiento">(
    "registro"
  );

  // Form fields
  const [procesoId, setProcesoId] = useState("");
  const [residenteId, setResidenteId] = useState("");
  const [residenteSeleccionado, setResidenteSeleccionado] = useState<any>(null);
  const [busquedaResidente, setBusquedaResidente] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mes, setMes] = useState("");
  const [encargadoEvaluacion, setEncargadoEvaluacion] = useState("");
  const [vacaciones, setVacaciones] = useState(false);
  const [licenciaMaternidad, setLicenciaMaternidad] = useState(false);
  const [otraAusencia, setOtraAusencia] = useState(false);
  const [tipoOtraAusencia, setTipoOtraAusencia] = useState("");
  const [conocimientos, setConocimientos] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [aptitudes, setAptitudes] = useState("");
  const [observacion, setObservacion] = useState("");
  const [hospital, setHospital] = useState("");
  const [rotacion, setRotacion] = useState("");

  // Refs para el autocompletado
  const inputRef = useRef<HTMLInputElement>(null);
  const sugerenciasRef = useRef<HTMLDivElement>(null);

  // Hook para obtener residentes inscritos en el proceso seleccionado
  const inscripcionesQuery = useGetInscripcionesConDetalles(
    procesoId || undefined
  );
  const residentesInscritos = inscripcionesQuery.data || [];

  // Hook para validar nota existente - solo cuando todos los campos están completos
  const mesNumero = mes ? Number.parseInt(mes, 10) : undefined;
  const { data: notaExistente, isLoading: validandoNota } =
    useValidarNotaExistente(
      procesoId || undefined,
      residenteId || undefined,
      mesNumero && mesNumero > 0 ? mesNumero : undefined
    );

  // Hook para obtener resumen del residente seleccionado
  const { data: resumenResidente } = useResumenNotasResidente(
    procesoId || undefined,
    residenteId || undefined
  );

  // Obtener el proceso seleccionado para calcular los meses
  const procesoSeleccionado = procesos.find((p) => p.id === procesoId);
  const mesesDisponibles = procesoSeleccionado
    ? getMesesProceso(
        procesoSeleccionado.fechaInicio instanceof Date
          ? procesoSeleccionado.fechaInicio
          : procesoSeleccionado.fechaInicio.toDate(),
        procesoSeleccionado.duracionMeses
      )
    : [];

  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId);
    return especialidad ? especialidad.nombre : "Especialidad no encontrada";
  };

  const getProcesoNombre = (procesoId: string) => {
    const proceso = procesos.find((p) => p.id === procesoId);
    return proceso ? proceso.nombre : "Proceso no encontrado";
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

  // Filtrar residentes basado en la búsqueda y proceso seleccionado
  const residentesFiltrados = residentesInscritos
    .filter((inscripcion) => {
      const residente = residentes.find(
        (r) => r.id === inscripcion.residenteId
      );
      if (!residente) return false;

      const nombreCompleto = residente.nombre;
      return nombreCompleto
        .toLowerCase()
        .includes(busquedaResidente.toLowerCase());
    })
    .slice(0, 10); // Limitar a 10 resultados

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sugerenciasRef.current &&
        !sugerenciasRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calcularPromedio = () => {
    const conocimientosNum = Number.parseFloat(conocimientos) || 0;
    const habilidadesNum = Number.parseFloat(habilidades) || 0;
    const aptitudesNum = Number.parseFloat(aptitudes) || 0;

    return (conocimientosNum + habilidadesNum + aptitudesNum) / 3;
  };

  const tieneAusencia = vacaciones || licenciaMaternidad || otraAusencia;

  const getTipoAusencia = () => {
    if (vacaciones) return "Vacaciones";
    if (licenciaMaternidad) return "Licencia de Maternidad";
    if (otraAusencia) return tipoOtraAusencia || "Otra ausencia";
    return "";
  };

  const getResidenteNombre = (residenteId: string) => {
    const residente = residentes.find((r) => r.id === residenteId);
    return residente ? residente.nombre : "Residente no encontrado";
  };

  const handleSeleccionarResidente = (inscripcion: any) => {
    const residente = residentes.find((r) => r.id === inscripcion.residenteId);
    if (residente) {
      setResidenteSeleccionado(residente);
      setResidenteId(inscripcion.residenteId);
      setBusquedaResidente(residente.nombre);
      setMostrarSugerencias(false);
    }
  };

  const handleLimpiarResidente = () => {
    setResidenteSeleccionado(null);
    setResidenteId("");
    setBusquedaResidente("");
    setMostrarSugerencias(false);
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaResidente(valor);

    if (valor.trim() === "") {
      handleLimpiarResidente();
    } else {
      setMostrarSugerencias(true);
      // Si hay un residente seleccionado y el texto no coincide, limpiar selección
      if (residenteSeleccionado && residenteSeleccionado.nombre !== valor) {
        setResidenteSeleccionado(null);
        setResidenteId("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !procesoId ||
      !residenteId ||
      !mes ||
      !encargadoEvaluacion.trim() ||
      !hospital ||
      !rotacion
    ) {
      setError("Todos los campos marcados con * son obligatorios");
      return;
    }

    // Validar si ya existe una nota para este mes
    if (notaExistente) {
      setError(
        `Ya existe una evaluación registrada para ${getMesNombre(
          Number.parseInt(mes, 10),
          procesoId
        )}. Solo se permite una evaluación por mes por residente.`
      );
      return;
    }

    if (!tieneAusencia && (!conocimientos || !habilidades || !aptitudes)) {
      setError("Las notas son obligatorias cuando no hay ausencias");
      return;
    }

    if (otraAusencia && !tipoOtraAusencia.trim()) {
      setError("Debe especificar el tipo de ausencia");
      return;
    }

    const conocimientosNum = Number.parseFloat(conocimientos);
    const habilidadesNum = Number.parseFloat(habilidades);
    const aptitudesNum = Number.parseFloat(aptitudes);

    if (
      !tieneAusencia &&
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
      setError("Las notas deben ser valores numéricos entre 0 y 20");
      return;
    }

    try {
      setError(null);

      const residente = residentes.find((r) => r.id === residenteId);

      if (!residente) {
        setError("Residente no encontrado");
        return;
      }

      const promedio = tieneAusencia ? 0 : calcularPromedio();
      const tipoAusenciaFinal = getTipoAusencia();

      await createNota.mutateAsync({
        procesoId,
        residenteId,
        mes: Number.parseInt(mes, 10),
        encargadoEvaluacion: encargadoEvaluacion.trim(),
        vacaciones: tieneAusencia,
        tipoAusencia: tipoAusenciaFinal,
        conocimientos: tieneAusencia ? 0 : conocimientosNum,
        habilidades: tieneAusencia ? 0 : habilidadesNum,
        aptitudes: tieneAusencia ? 0 : aptitudesNum,
        promedio,
        observacion,
        responsable: currentUser?.displayName || "Desconocido",
        responsableId: currentUser?.uid || "",
        especialidad: getEspecialidadNombre(residente.especialidadId),
        anioAcademico: residente.anioAcademico,
        hospital,
        rotacion,
      });

      // Resetear formulario
      setProcesoId("");
      handleLimpiarResidente();
      setMes("");
      setEncargadoEvaluacion("");
      setVacaciones(false);
      setLicenciaMaternidad(false);
      setOtraAusencia(false);
      setTipoOtraAusencia("");
      setConocimientos("");
      setHabilidades("");
      setAptitudes("");
      setObservacion("");
      setHospital("");
      setRotacion("");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error al registrar nota:", error);
      setError("Error al registrar la nota. Inténtalo de nuevo.");
    }
  };

  if (loadingResidentes || loadingEspecialidades || loadingProcesos) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Determinar si se debe mostrar la alerta de nota existente
  const mostrarAlertaNotaExistente =
    notaExistente &&
    procesoId &&
    residenteId &&
    mes &&
    Number.parseInt(mes, 10) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registro Mensual</h1>

        {/* Navegación entre vistas */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setVistaActual("registro")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              vistaActual === "registro"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Registro
          </button>
          <button
            onClick={() => setVistaActual("seguimiento")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              vistaActual === "seguimiento"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Seguimiento
          </button>
        </div>
      </div>

      {vistaActual === "seguimiento" ? (
        <div className="space-y-6">
          {/* Selector de proceso para seguimiento */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Seleccionar Proceso para Seguimiento
            </h2>
            <div className="max-w-md">
              <select
                value={procesoId}
                onChange={(e) => setProcesoId(e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar proceso</option>
                {procesos
                  .filter((p) => p.activo)
                  .map((proceso) => (
                    <option key={proceso.id} value={proceso.id}>
                      {proceso.nombre} - {proceso.anioAcademico}° Año
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <SeguimientoNotas procesoId={procesoId} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Nuevo Registro
            </h2>

            {success && (
              <div
                className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
                role="alert"
              >
                <p>Nota registrada exitosamente.</p>
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

            {/* Alerta de nota existente */}
            {mostrarAlertaNotaExistente && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      <strong>Evaluación ya registrada:</strong> Ya existe una
                      evaluación para{" "}
                      {getMesNombre(Number.parseInt(mes, 10), procesoId)}. Solo
                      se permite una evaluación por mes por residente.
                    </p>
                    <p className="text-xs mt-1">
                      Fecha de registro:{" "}
                      {notaExistente.createdAt instanceof Date
                        ? notaExistente.createdAt.toLocaleDateString()
                        : notaExistente.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString() || "No disponible"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Selector de proceso */}
                <div>
                  <label
                    htmlFor="proceso"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Proceso de Residentado *
                  </label>
                  <select
                    id="proceso"
                    value={procesoId}
                    onChange={(e) => {
                      setProcesoId(e.target.value);
                      // Limpiar residente seleccionado al cambiar proceso
                      handleLimpiarResidente();
                      // Limpiar mes seleccionado al cambiar proceso
                      setMes("");
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar proceso</option>
                    {procesos
                      .filter((p) => p.activo)
                      .map((proceso) => (
                        <option key={proceso.id} value={proceso.id}>
                          {proceso.nombre} - {proceso.anioAcademico}° Año (
                          {proceso.duracionMeses} meses)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Campo de búsqueda de residente */}
                <div className="relative">
                  <label
                    htmlFor="residente"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Residente *
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      id="residente"
                      value={busquedaResidente}
                      onChange={handleBusquedaChange}
                      onFocus={() =>
                        busquedaResidente && setMostrarSugerencias(true)
                      }
                      className={`input-field pr-10 ${
                        residenteSeleccionado
                          ? "bg-green-50 border-green-300"
                          : ""
                      }`}
                      placeholder={
                        procesoId
                          ? "Buscar residente inscrito..."
                          : "Seleccione un proceso primero"
                      }
                      disabled={!procesoId}
                      required
                    />

                    {/* Icono de búsqueda o check */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {residenteSeleccionado ? (
                        <button
                          type="button"
                          onClick={handleLimpiarResidente}
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      )}
                    </div>

                    {/* Sugerencias */}
                    {mostrarSugerencias &&
                      busquedaResidente &&
                      residentesFiltrados.length > 0 && (
                        <div
                          ref={sugerenciasRef}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          {residentesFiltrados.map((inscripcion) => {
                            const residente = residentes.find(
                              (r) => r.id === inscripcion.residenteId
                            );
                            if (!residente) return null;

                            return (
                              <button
                                key={inscripcion.id}
                                type="button"
                                onClick={() =>
                                  handleSeleccionarResidente(inscripcion)
                                }
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">
                                  {residente.nombre}
                                </div>
                                <div className="text-sm text-gray-500">
                                  CUI: {residente.cui} • DNI: {residente.dni}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    {/* Mensaje cuando no hay resultados */}
                    {mostrarSugerencias &&
                      busquedaResidente &&
                      residentesFiltrados.length === 0 && (
                        <div
                          ref={sugerenciasRef}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4"
                        >
                          <div className="text-gray-500 text-center">
                            No se encontraron residentes inscritos que coincidan
                            con "{busquedaResidente}"
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Información del residente seleccionado */}
                  {residenteSeleccionado && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-900">
                            {residenteSeleccionado.nombre}
                          </div>
                          <div className="text-sm text-green-700">
                            {getEspecialidadNombre(
                              residenteSeleccionado.especialidadId
                            )}{" "}
                            • {residenteSeleccionado.anioAcademico}° Año
                          </div>
                          <div className="text-xs text-green-600">
                            CUI: {residenteSeleccionado.cui} • DNI:{" "}
                            {residenteSeleccionado.dni}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleLimpiarResidente}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Limpiar selección"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mes *
                  </label>
                  <select
                    id="mes"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className={`input-field ${
                      mostrarAlertaNotaExistente
                        ? "border-yellow-300 bg-yellow-50"
                        : ""
                    }`}
                    required
                    disabled={!procesoId}
                  >
                    <option value="">
                      {procesoId
                        ? "Seleccionar mes"
                        : "Seleccione un proceso primero"}
                    </option>
                    {mesesDisponibles.map((mesInfo) => (
                      <option
                        key={mesInfo.numero}
                        value={mesInfo.numero.toString()}
                      >
                        {mesInfo.nombre}
                      </option>
                    ))}
                  </select>
                  {procesoSeleccionado && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duración del proceso: {procesoSeleccionado.duracionMeses}{" "}
                      meses
                    </p>
                  )}
                  {validandoNota && (
                    <div className="flex items-center mt-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-purple-500 mr-1"></div>
                      <span className="text-xs text-gray-500">
                        Validando disponibilidad...
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="encargadoEvaluacion"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Encargado de la Evaluación *
                  </label>
                  <input
                    type="text"
                    id="encargadoEvaluacion"
                    value={encargadoEvaluacion}
                    onChange={(e) => setEncargadoEvaluacion(e.target.value)}
                    className="input-field"
                    placeholder="Ej: Dr. Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vacaciones"
                      checked={vacaciones}
                      onChange={(e) => {
                        setVacaciones(e.target.checked);
                        if (e.target.checked) {
                          setLicenciaMaternidad(false);
                          setOtraAusencia(false);
                          setTipoOtraAusencia("");
                          setConocimientos("");
                          setHabilidades("");
                          setAptitudes("");
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="vacaciones"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Vacaciones
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="licenciaMaternidad"
                      checked={licenciaMaternidad}
                      onChange={(e) => {
                        setLicenciaMaternidad(e.target.checked);
                        if (e.target.checked) {
                          setVacaciones(false);
                          setOtraAusencia(false);
                          setTipoOtraAusencia("");
                          setConocimientos("");
                          setHabilidades("");
                          setAptitudes("");
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="licenciaMaternidad"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Licencia de Maternidad
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="otraAusencia"
                        checked={otraAusencia}
                        onChange={(e) => {
                          setOtraAusencia(e.target.checked);
                          if (e.target.checked) {
                            setVacaciones(false);
                            setLicenciaMaternidad(false);
                            setConocimientos("");
                            setHabilidades("");
                            setAptitudes("");
                          } else {
                            setTipoOtraAusencia("");
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="otraAusencia"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Otra ausencia
                      </label>
                    </div>

                    {otraAusencia && (
                      <input
                        type="text"
                        value={tipoOtraAusencia}
                        onChange={(e) => setTipoOtraAusencia(e.target.value)}
                        className="input-field ml-6"
                        placeholder="Especificar tipo de ausencia"
                        required={otraAusencia}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="hospital"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
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
                    <label
                      htmlFor="rotacion"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
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

              {/* Resumen del residente seleccionado */}
              {resumenResidente && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">
                    Resumen de Evaluaciones - {residenteSeleccionado?.nombre}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Total meses:</span>
                      <span className="ml-2 font-medium">
                        {resumenResidente.totalMeses}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Registradas:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {resumenResidente.notasRegistradas}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Pendientes:</span>
                      <span className="ml-2 font-medium text-yellow-600">
                        {resumenResidente.notasPendientes}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Promedio:</span>
                      <span className="ml-2 font-medium">
                        {resumenResidente.promedioGeneral.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {resumenResidente.mesesPendientes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="text-sm text-blue-600">
                        Meses pendientes:{" "}
                      </span>
                      <span className="text-sm font-medium text-yellow-700">
                        {resumenResidente.mesesPendientes
                          .map((m) => getMesNombre(m, procesoId))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="conocimientos"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Conocimientos (0-20) *
                  </label>
                  <input
                    type="number"
                    id="conocimientos"
                    value={conocimientos}
                    onChange={(e) => setConocimientos(e.target.value)}
                    className={`input-field ${
                      tieneAusencia ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    min="0"
                    max="20"
                    step="0.01"
                    disabled={tieneAusencia}
                    required={!tieneAusencia}
                  />
                </div>

                <div>
                  <label
                    htmlFor="habilidades"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Habilidades (0-20) *
                  </label>
                  <input
                    type="number"
                    id="habilidades"
                    value={habilidades}
                    onChange={(e) => setHabilidades(e.target.value)}
                    className={`input-field ${
                      tieneAusencia ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    min="0"
                    max="20"
                    step="0.01"
                    disabled={tieneAusencia}
                    required={!tieneAusencia}
                  />
                </div>

                <div>
                  <label
                    htmlFor="aptitudes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Aptitudes (0-20) *
                  </label>
                  <input
                    type="number"
                    id="aptitudes"
                    value={aptitudes}
                    onChange={(e) => setAptitudes(e.target.value)}
                    className={`input-field ${
                      tieneAusencia ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    min="0"
                    max="20"
                    step="0.01"
                    disabled={tieneAusencia}
                    required={!tieneAusencia}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="observacion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  <span className="text-sm text-gray-500">
                    * Campos obligatorios
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    Promedio:{" "}
                    <span className="text-lg">
                      {calcularPromedio().toFixed(2)}
                    </span>
                  </span>

                  <button
                    type="submit"
                    className={`btn-primary ${
                      mostrarAlertaNotaExistente || validandoNota
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      createNota.isPending ||
                      mostrarAlertaNotaExistente ||
                      validandoNota
                    }
                  >
                    {createNota.isPending
                      ? "Guardando..."
                      : validandoNota
                      ? "Validando..."
                      : "Guardar Evaluación"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Lista de notas registradas */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Registros Mensuales
            </h2>

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
                        Proceso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Residente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Encargado de Evaluación
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
                      return (
                        <tr key={nota.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getProcesoNombre(nota.procesoId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getResidenteNombre(nota.residenteId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getMesNombre(nota.mes, nota.procesoId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {nota.encargadoEvaluacion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {nota.hospital}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {nota.rotacion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                nota.vacaciones
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {nota.vacaciones
                                ? nota.tipoAusencia || "Vacaciones"
                                : "Activo"}
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
                  No hay registros
                </h3>
                <p className="mt-1 text-gray-500">
                  No se han registrado evaluaciones aún.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroNotas;
