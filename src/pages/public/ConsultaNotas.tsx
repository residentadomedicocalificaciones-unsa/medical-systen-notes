"use client";

import { useState } from "react";
import { useResidentes, useNotas, useEspecialidades } from "../../hooks";
import { useProcesosResidentado } from "../../hooks/useProcesosResidentado";
import { getMesNombrePorNumero } from "../../utils/dateUtils";

const ConsultaNotas = () => {
  const { getAll: getAllResidentes } = useResidentes();
  const { getAll: getAllNotas } = useNotas();
  const { getAll: getEspecialidades } = useEspecialidades();
  const { getConDetalles } = useProcesosResidentado();

  const { data: residentes = [], isLoading: loadingResidentes } =
    getAllResidentes();
  const {
    query: { data: notas = [], isLoading: loadingNotas },
  } = getAllNotas();
  const { data: especialidades = [], isLoading: loadingEspecialidades } =
    getEspecialidades();
  const { data: procesos = [], isLoading: loadingProcesos } = getConDetalles;

  const [email, setEmail] = useState("");
  const [cui, setCui] = useState("");
  const [dni, setDni] = useState("");
  const [residenteEncontrado, setResidenteEncontrado] = useState<any>(null);
  const [notasResidente, setNotasResidente] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId);
    return especialidad ? especialidad.nombre : "No encontrada";
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

  const buscarResidente = async () => {
    // Validar que todos los campos estén llenos
    if (!email.trim() || !cui.trim() || !dni.trim()) {
      setError(
        "Debe completar todos los campos: email institucional, CUI y DNI"
      );
      return;
    }

    setBuscando(true);
    setError(null);
    setResidenteEncontrado(null);
    setNotasResidente([]);

    try {
      // Buscar residente que coincida exactamente con los 3 datos
      const residente = residentes.find((r) => {
        const coincideEmail =
          r.email.toLowerCase() === email.trim().toLowerCase();
        const coincideCui = r.cui === cui.trim();
        const coincideDni = r.dni === dni.trim();
        return coincideEmail && coincideCui && coincideDni;
      });

      if (!residente) {
        setError(
          "Los datos ingresados no coinciden con ningún residente registrado. Verifique que el email institucional, CUI y DNI sean correctos."
        );
        return;
      }

      setResidenteEncontrado(residente);

      // Buscar notas del residente
      const notasDelResidente = notas
        .filter((nota) => nota.residenteId === residente.id)
        .sort((a, b) => a.mes - b.mes);

      setNotasResidente(notasDelResidente);
    } catch (error) {
      console.error("Error al buscar residente:", error);
      setError("Error al realizar la búsqueda. Inténtalo de nuevo.");
    } finally {
      setBuscando(false);
    }
  };

  const calcularPromedioGeneral = () => {
    const notasActivas = notasResidente.filter((nota) => !nota.vacaciones);
    if (notasActivas.length === 0) return 0;

    const suma = notasActivas.reduce((acc, nota) => acc + nota.promedio, 0);
    return suma / notasActivas.length;
  };

  const limpiarBusqueda = () => {
    setEmail("");
    setCui("");
    setDni("");
    setResidenteEncontrado(null);
    setNotasResidente([]);
    setError(null);
  };

  if (
    loadingResidentes ||
    loadingNotas ||
    loadingEspecialidades ||
    loadingProcesos
  ) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Consulta de Evaluaciones
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Consulta Pública - Programa de Residentado Médico
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Identificación del Residente
            </h2>
            <p className="text-gray-600">
              Complete todos los campos para acceder a las evaluaciones
            </p>
          </div>

          <div className="px-8 py-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email Institucional
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ejemplo@hospital.gob.pe"
                />
                <p className="text-xs text-gray-500">
                  Correo electrónico institucional del residente
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cui"
                  className="block text-sm font-semibold text-gray-700"
                >
                  CUI ( dígitos)
                </label>
                <input
                  type="text"
                  id="cui"
                  value={cui}
                  onChange={(e) => setCui(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="1234567890123"
                  maxLength={13}
                />
                <p className="text-xs text-gray-500">
                  Código Único de Identificación de 13 dígitos
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="dni"
                  className="block text-sm font-semibold text-gray-700"
                >
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="12345678"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500">
                  Documento Nacional de Identidad de 8 dígitos
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Importante:</strong> Todos los campos son
                    obligatorios. Los tres datos deben coincidir exactamente con
                    los registrados en el sistema para poder acceder a las
                    evaluaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={buscarResidente}
                disabled={
                  buscando || !email.trim() || !cui.trim() || !dni.trim()
                }
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buscando ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  "Consultar Evaluaciones"
                )}
              </button>

              {(residenteEncontrado || error) && (
                <button
                  onClick={limpiarBusqueda}
                  className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Nueva Consulta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información del residente */}
        {residenteEncontrado && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Información del Residente
              </h2>
            </div>

            <div className="px-8 py-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-blue-900">
                      {residenteEncontrado.nombre}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-semibold text-blue-800 w-20">
                          Email:
                        </span>
                        <span className="text-blue-700">
                          {residenteEncontrado.email}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-blue-800 w-20">
                          CUI:
                        </span>
                        <span className="text-blue-700 font-mono">
                          {residenteEncontrado.cui}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-blue-800 w-20">
                          DNI:
                        </span>
                        <span className="text-blue-700 font-mono">
                          {residenteEncontrado.dni}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-semibold text-blue-800 w-32">
                          Especialidad:
                        </span>
                        <span className="text-blue-700">
                          {getEspecialidadNombre(
                            residenteEncontrado.especialidadId
                          )}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-blue-800 w-32">
                          Año Académico:
                        </span>
                        <span className="text-blue-700">
                          {residenteEncontrado.anioAcademico}° Año
                        </span>
                      </div>
                      {notasResidente.length > 0 && (
                        <div className="flex items-center">
                          <span className="font-semibold text-blue-800 w-32">
                            Promedio General:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              calcularPromedioGeneral() >= 14
                                ? "bg-green-100 text-green-800"
                                : calcularPromedioGeneral() >= 11
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {calcularPromedioGeneral().toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de evaluaciones */}
        {residenteEncontrado && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Historial de Evaluaciones
              </h2>
            </div>

            <div className="px-8 py-6">
              {notasResidente.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proceso
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Período
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hospital
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Servicio
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Encargado
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conocimientos
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Habilidades
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aptitudes
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Promedio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {notasResidente.map((nota) => (
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {getProcesoNombre(nota.procesoId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {getMesNombre(nota.mes, nota.procesoId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {nota.hospital}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {nota.rotacion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {nota.encargadoEvaluacion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {nota.vacaciones
                                ? "-"
                                : nota.conocimientos.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {nota.vacaciones
                                ? "-"
                                : nota.habilidades.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {nota.vacaciones
                                ? "-"
                                : nota.aptitudes.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                              {nota.vacaciones ? (
                                <span className="text-gray-500">-</span>
                              ) : (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
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

                  {/* Resumen estadístico */}
                  <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Resumen Estadístico
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {notasResidente.length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Total Evaluaciones
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {notasResidente.filter((n) => !n.vacaciones).length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Evaluaciones Activas
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {notasResidente.filter((n) => n.vacaciones).length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Ausencias Registradas
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold ${
                            calcularPromedioGeneral() >= 14
                              ? "text-green-600"
                              : calcularPromedioGeneral() >= 11
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {calcularPromedioGeneral().toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Promedio General
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No hay evaluaciones registradas
                  </h3>
                  <p className="text-gray-500">
                    Este residente no tiene evaluaciones disponibles en el
                    sistema.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConsultaNotas;
