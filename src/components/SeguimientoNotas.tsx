import type React from "react";
import { useSeguimientoNotas } from "../hooks/useSeguimientoNotas";
import { useResidentes, useEspecialidades } from "../hooks";
import { useProcesosResidentado } from "../hooks/useProcesosResidentado";
import { useInscripcionesProceso } from "../hooks/useInscripcionesProceso";
import { getMesNombrePorNumero } from "../utils/dateUtils";
import type { Residente } from "../types";
import ExportButton from "./ExportButton";

interface SeguimientoNotasProps {
  procesoId: string;
}

const SeguimientoNotas: React.FC<SeguimientoNotasProps> = ({ procesoId }) => {
  const { useSeguimientoProceso } = useSeguimientoNotas();
  const { data: residentes = [] } = useResidentes().getAll();
  const { data: especialidades = [] } = useEspecialidades().getAll();
  const { getConDetalles } = useProcesosResidentado();
  const { useGetInscripcionesConDetalles } = useInscripcionesProceso();

  const { data: procesos = [] } = getConDetalles;
  const { data: seguimiento, isLoading } = useSeguimientoProceso(procesoId);
  const inscripcionesQuery = useGetInscripcionesConDetalles(
    procesoId || undefined
  );
  const residentesInscritos = inscripcionesQuery.data || [];

  const proceso = procesos.find((p) => p.id === procesoId);

  const getEspecialidadNombre = (especialidadId: string) => {
    const especialidad = especialidades.find((e) => e.id === especialidadId);
    return especialidad ? especialidad.nombre : "Especialidad no encontrada";
  };

  const getMesNombre = (numeroMes: number) => {
    if (!proceso) return `Mes ${numeroMes}`;

    const fechaInicio =
      proceso.fechaInicio instanceof Date
        ? proceso.fechaInicio
        : proceso.fechaInicio.toDate();

    return getMesNombrePorNumero(numeroMes, fechaInicio);
  };

  if (!procesoId) {
    return (
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h10a4 4 0 014 4v14a4 4 0 01-4 4z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Selecciona un proceso
        </h3>
        <p className="mt-1 text-gray-500">
          Elige un proceso de residentado para ver el seguimiento de
          evaluaciones.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!seguimiento) {
    return (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No se pudo cargar el seguimiento
        </h3>
        <p className="mt-1 text-gray-500">
          Ocurrió un error al cargar los datos del proceso.
        </p>
      </div>
    );
  }

  // Obtener residentes inscritos con sus datos completos
  const residentesConDatos = residentesInscritos
    .map((inscripcion) => {
      const residente = residentes.find(
        (r) => r.id === inscripcion.residenteId
      );
      return residente ? { ...residente, inscripcionId: inscripcion.id } : null;
    })
    .filter(Boolean) as Residente[];

  return (
    <div className="space-y-6">
      {/* Header con información del proceso y botón de exportar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Seguimiento: {proceso?.nombre}
            </h2>
            <p className="text-sm text-gray-600">
              {proceso?.anioAcademico}° Año • {proceso?.duracionMeses} meses
            </p>
          </div>

          {proceso && residentesConDatos.length > 0 && (
            <ExportButton
              proceso={proceso}
              residentes={residentesConDatos}
              variant="proceso"
              className="ml-4"
            />
          )}
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {seguimiento.totalResidentes}
            </div>
            <div className="text-sm text-blue-800">Residentes Inscritos</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {seguimiento.notasRegistradas}
            </div>
            <div className="text-sm text-green-800">
              Evaluaciones Registradas
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {seguimiento.notasPendientes}
            </div>
            <div className="text-sm text-yellow-800">
              Evaluaciones Pendientes
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {seguimiento.porcentajeCompletado.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-800">Completado</div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso General</span>
            <span>{seguimiento.porcentajeCompletado.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${seguimiento.porcentajeCompletado}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progreso por mes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Progreso por Mes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seguimiento.detallesPorMes.map((detalle) => (
            <div
              key={detalle.mes}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {getMesNombre(detalle.mes)}
                </h4>
                <span className="text-sm text-gray-500">
                  {detalle.porcentaje.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Registradas:</span>
                  <span className="font-medium">{detalle.registradas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Pendientes:</span>
                  <span className="font-medium">{detalle.pendientes}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      detalle.porcentaje === 100
                        ? "bg-green-500"
                        : detalle.porcentaje >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${detalle.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de residentes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Residentes Inscritos
        </h3>
        {residentesConDatos.length > 0 ? (
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
                    CUI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año Académico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {residentesConDatos.map((residente) => (
                  <tr key={residente?.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {residente?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEspecialidadNombre(residente?.especialidadId!)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {residente?.cui}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {residente?.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {residente?.anioAcademico}° Año
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proceso && (
                        <ExportButton
                          proceso={proceso}
                          residente={residente}
                          variant="residente"
                          className="text-xs px-2 py-1"
                        />
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No hay residentes inscritos
            </h3>
            <p className="mt-1 text-gray-500">
              No se encontraron residentes inscritos en este proceso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeguimientoNotas;
