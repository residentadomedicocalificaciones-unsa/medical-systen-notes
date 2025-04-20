"use client"

import { useNotas, useResidentes } from "../../hooks"
import type { Nota } from "../../types"

const Dashboard = () => {
  const { getAll: getAllResidentes } = useResidentes()
  const { getLatestNotas, getEstadisticasPorEspecialidad } = useNotas()

  const { data: residentes = [], isLoading: loadingResidentes } = getAllResidentes()
  const { query: { data: ultimasNotas = [], isLoading: loadingNotas } } = getLatestNotas(5)
  const { query: { isLoading: loadingEstadisticas } } = getEstadisticasPorEspecialidad()

  const isLoading = loadingResidentes || loadingNotas || loadingEstadisticas

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Obtener especialidades únicas
  const especialidades = [...new Set(residentes.map((r) => r.especialidad))]

  // Obtener años académicos únicos
  const aniosAcademicos = [...new Set(residentes.map((r) => r.anioAcademico))]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-30">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Residentes</h2>
              <p className="text-3xl font-bold">{residentes.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-30">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Especialidades</h2>
              <p className="text-3xl font-bold">{especialidades.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-30">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Evaluaciones</h2>
              <p className="text-3xl font-bold">{ultimasNotas.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Últimas Evaluaciones</h2>

        {ultimasNotas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Residente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rotación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ultimasNotas.map((nota: Nota) => {
                  // Buscar el nombre del residente
                  const residente = residentes.find((r) => r.id === nota.residenteId)
                  const residenteNombre = residente?.nombre || "Desconocido"

                  // Formatear la fecha
                  const fecha =
                    nota.fecha instanceof Date
                      ? nota.fecha.toLocaleDateString()
                      : nota.fecha?.toDate?.().toLocaleDateString() || "Fecha desconocida"

                  return (
                    <tr key={nota.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {residenteNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.rotacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.hospital}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fecha}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay evaluaciones registradas.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución por Especialidad</h2>

          {especialidades.length > 0 ? (
            <div>
              {especialidades.map((especialidad) => {
                const count = residentes.filter((r) => r.especialidad === especialidad).length
                const percentage = (count / residentes.length) * 100

                return (
                  <div key={especialidad} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{especialidad}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay residentes registrados.</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución por Año Académico</h2>

          {aniosAcademicos.length > 0 ? (
            <div>
              {aniosAcademicos.map((anio) => {
                const count = residentes.filter((r) => r.anioAcademico === anio).length
                const percentage = (count / residentes.length) * 100

                return (
                  <div key={anio} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Año {anio}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay residentes registrados.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
