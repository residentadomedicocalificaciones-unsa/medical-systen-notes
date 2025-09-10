"use client";

import type React from "react";
import { useState } from "react";
import {
  useResidentes,
  useEspecialidades,
  useSedes,
  useNotas,
} from "../../hooks";
import type { Residente } from "../../types";

const Residentes = () => {
  const { getAll, create, update, remove } = useResidentes();
  const { getAllOrdenadas: getEspecialidades } = useEspecialidades();
  const { getAll: getSedes } = useSedes();
  const { getByResidenteId } = useNotas();

  const { data: residentes = [], isLoading: loadingResidentes } = getAll();
  const { data: especialidades = [], isLoading: loadingEspecialidades } =
    getEspecialidades();
  const { data: sedes = [], isLoading: loadingSedes } = getSedes();

  const [vistaActual, setVistaActual] = useState<
    "lista" | "formulario" | "detalles"
  >("lista");
  const [residenteEditando, setResidenteEditando] = useState<Residente | null>(
    null
  );
  const [residenteDetalles, setResidenteDetalles] = useState<Residente | null>(
    null
  );
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [cui, setCui] = useState("");
  const [dni, setDni] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [sedeRotacionId, setSedeRotacionId] = useState("");
  const [anioIngreso, setAnioIngreso] = useState("");
  const [anioAcademico, setAnioAcademico] = useState("");

  // Hook para obtener notas del residente en detalles
  const {
    query: { data: notasResidente = [], isLoading: loadingNotas },
  } = getByResidenteId(residenteDetalles?.id || "");

  const resetForm = () => {
    setNombre("");
    setEmail("");
    setCui("");
    setDni("");
    setEspecialidadId("");
    setSedeRotacionId("");
    setAnioIngreso("");
    setAnioAcademico("");
    setResidenteEditando(null);
    setError(null);
  };

  const handleNuevoResidente = () => {
    resetForm();
    setVistaActual("formulario");
  };

  const handleEditarResidente = (residente: Residente) => {
    setResidenteEditando(residente);
    setNombre(residente.nombre);
    setEmail(residente.email);
    setCui(residente.cui);
    setDni(residente.dni);
    setEspecialidadId(residente.especialidadId);
    setAnioIngreso(residente.anioIngreso);
    setAnioAcademico(residente.anioAcademico);
    setVistaActual("formulario");
  };

  const handleVerDetalles = (residente: Residente) => {
    setResidenteDetalles(residente);
    setVistaActual("detalles");
  };

  const handleEliminarResidente = async (residente: Residente) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar a ${residente.nombre}?`
      )
    ) {
      try {
        await remove.mutateAsync(residente.id!);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Error al eliminar residente:", error);
        setError("Error al eliminar el residente. Inténtalo de nuevo.");
      }
    }
  };

  const validarFormulario = () => {
    if (
      !nombre.trim() ||
      !email.trim() ||
      !cui.trim() ||
      !dni.trim() ||
      !especialidadId ||
      !sedeRotacionId ||
      !anioIngreso ||
      !anioAcademico
    ) {
      setError("Todos los campos son obligatorios");
      return false;
    }

    if (cui.length !== 8 || !/^\d+$/.test(cui)) {
      setError("El CUI debe tener exactamente 8 dígitos");
      return false;
    }

    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError("El DNI debe tener exactamente 8 dígitos");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El email no tiene un formato válido");
      return false;
    }

    const anioActual = new Date().getFullYear();
    const anioIngresoNum = Number.parseInt(anioIngreso);
    if (anioIngresoNum < 2000 || anioIngresoNum > anioActual + 1) {
      setError("El año de ingreso debe estar entre 2000 y el próximo año");
      return false;
    }

    // Validar duplicados
    const residenteExistente = residentes.find(
      (r) =>
        r.id !== residenteEditando?.id &&
        (r.email.toLowerCase() === email.toLowerCase() ||
          r.cui === cui ||
          r.dni === dni)
    );

    if (residenteExistente) {
      if (residenteExistente.email.toLowerCase() === email.toLowerCase()) {
        setError("Ya existe un residente con este email");
      } else if (residenteExistente.cui === cui) {
        setError("Ya existe un residente con este CUI");
      } else if (residenteExistente.dni === dni) {
        setError("Ya existe un residente con este DNI");
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setError(null);

      const residenteData = {
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        cui: cui.trim(),
        dni: dni.trim(),
        especialidadId,
        sedeRotacionId,
        anioIngreso,
        anioAcademico,
      };

      if (residenteEditando) {
        await update.mutateAsync({
          id: residenteEditando.id!,
          data: residenteData,
        });
      } else {
        await create.mutateAsync(residenteData);
      }

      resetForm();
      setVistaActual("lista");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al guardar residente:", error);
      setError("Error al guardar el residente. Inténtalo de nuevo.");
    }
  };

  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId);
    return especialidad ? especialidad.nombre : "Especialidad no encontrada";
  };

  const getSedeNombre = (sedeId: string) => {
    const sede = sedes.find((s) => s.id === sedeId);
    return sede ? sede.nombre : "Sede no encontrada";
  };

  // Filtrar residentes basado en la búsqueda
  const residentesFiltrados = residentes.filter(
    (residente) =>
      residente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      residente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      residente.cui.includes(busqueda) ||
      residente.dni.includes(busqueda) ||
      getEspecialidadNombre(residente.especialidadId)
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  if (loadingResidentes || loadingEspecialidades || loadingSedes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Residentes
        </h1>

        {vistaActual === "lista" && (
          <button onClick={handleNuevoResidente} className="btn-primary">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo Residente
          </button>
        )}

        {(vistaActual === "formulario" || vistaActual === "detalles") && (
          <button
            onClick={() => setVistaActual("lista")}
            className="btn-secondary"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a la Lista
          </button>
        )}
      </div>

      {success && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p>
            {residenteEditando
              ? "Residente actualizado exitosamente."
              : "Residente creado exitosamente."}
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

      {/* Vista de Lista */}
      {vistaActual === "lista" && (
        <div className="space-y-6">
          {/* Barra de búsqueda */}
          <div className="card">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-field pl-10"
                placeholder="Buscar por nombre, email, CUI, DNI o especialidad..."
              />
            </div>
          </div>

          {/* Lista de residentes */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Residentes Registrados ({residentesFiltrados.length})
            </h2>

            {residentesFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Residente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Año Académico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sede
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {residentesFiltrados.map((residente) => (
                      <tr key={residente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {residente.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              CUI: {residente.cui} • DNI: {residente.dni}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getEspecialidadNombre(residente.especialidadId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {residente.anioAcademico == "Egresado"
                            ? "Egresado"
                            : `${residente.anioAcademico}° Año`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getSedeNombre(residente.sedeRotacionId || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {residente.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVerDetalles(residente)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
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
                              onClick={() => handleEditarResidente(residente)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEliminarResidente(residente)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    ? `No hay residentes que coincidan con "${busqueda}"`
                    : "Comienza agregando un nuevo residente."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista de Formulario */}
      {vistaActual === "formulario" && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {residenteEditando ? "Editar Residente" : "Nuevo Residente"}
          </h2>

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
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
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

              <div>
                <label
                  htmlFor="cui"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CUI (8 dígitos) *
                </label>
                <input
                  type="text"
                  id="cui"
                  value={cui}
                  onChange={(e) =>
                    setCui(e.target.value.replace(/\D/g, "").slice(0, 13))
                  }
                  className="input-field"
                  placeholder="1234567890123"
                  maxLength={13}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="dni"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  DNI (8 dígitos) *
                </label>
                <input
                  type="text"
                  id="dni"
                  value={dni}
                  onChange={(e) =>
                    setDni(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  className="input-field"
                  placeholder="12345678"
                  maxLength={8}
                  required
                />
              </div>

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
                  {especialidades.map((especialidad) => (
                    <option key={especialidad.id} value={especialidad.id}>
                      {especialidad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="sede"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sede de Rotación *
                </label>
                <select
                  id="sede"
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
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  required
                />
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
                  <option value="">Seleccionar año</option>
                  <option value="1">1° Año</option>
                  <option value="2">2° Año</option>
                  <option value="3">3° Año</option>
                  <option value="4">4° Año</option>
                  <option value="5">5° Año</option>
                  <option value="Egresado">Egresado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                * Campos obligatorios
              </span>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setVistaActual("lista")}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Guardando..."
                    : residenteEditando
                    ? "Actualizar Residente"
                    : "Crear Residente"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Vista de Detalles */}
      {vistaActual === "detalles" && residenteDetalles && (
        <div className="space-y-6">
          {/* Información del residente */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Detalles del Residente
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditarResidente(residenteDetalles)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Personal
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Nombre
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.nombre}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CUI</dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.cui}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">DNI</dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.dni}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Académica
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Especialidad
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {getEspecialidadNombre(residenteDetalles.especialidadId)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Sede de Rotación
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {getSedeNombre(residenteDetalles.sedeRotacionId || "")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Año de Ingreso
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.anioIngreso}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Año Académico
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {residenteDetalles.anioAcademico === "Egresado"
                        ? "Egresado"
                        : `${residenteDetalles.anioAcademico}° Año`}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Estadísticas de evaluaciones */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-white bg-opacity-30">
                  <svg
                    className="h-8 w-8"
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
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Evaluaciones</h2>
                  <p className="text-2xl font-bold">{notasResidente.length}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-white bg-opacity-30">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Promedio</h2>
                  <p className="text-2xl font-bold">
                    {notasResidente.length > 0
                      ? (
                          notasResidente
                            .filter((n) => !n.vacaciones)
                            .reduce((sum, n) => sum + n.promedio, 0) /
                            notasResidente.filter((n) => !n.vacaciones)
                              .length || 0
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-white bg-opacity-30">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Ausencias</h2>
                  <p className="text-2xl font-bold">
                    {notasResidente.filter((n) => n.vacaciones).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-white bg-opacity-30">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Activas</h2>
                  <p className="text-2xl font-bold">
                    {notasResidente.filter((n) => !n.vacaciones).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de evaluaciones */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Historial de Evaluaciones
            </h3>

            {loadingNotas ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : notasResidente.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {notasResidente
                      .sort((a, b) => a.mes - b.mes)
                      .map((nota) => (
                        <tr key={nota.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Mes {nota.mes}
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
                      ))}
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
                  Sin evaluaciones
                </h3>
                <p className="mt-1 text-gray-500">
                  Este residente aún no tiene evaluaciones registradas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Residentes;
