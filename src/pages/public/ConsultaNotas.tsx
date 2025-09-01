"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { residenteService, notaService } from "../../services";

const ConsultaNotas = () => {
  const [email, setEmail] = useState("");
  const [cui, setCui] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [residenteId, setResidenteId] = useState<string | null>(null);

  const { data: notas = [], isLoading: loadingNotas } = useQuery({
    queryKey: ["notas", "residente", residenteId],
    queryFn: () =>
      residenteId
        ? notaService.getByResidenteId(residenteId)
        : Promise.resolve([]),
    enabled: !!residenteId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !cui || !dni) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setError(null);

      // Verificar si el residente existe
      const residente = await residenteService.getByCredentials(
        email,
        cui,
        dni
      );

      if (!residente) {
        setError(
          "No se encontró ningún residente con las credenciales proporcionadas"
        );
        setResidenteId(null);
        setConsultaRealizada(true);
        return;
      }

      setResidenteId(residente.id || null);
      setConsultaRealizada(true);
    } catch (err) {
      console.error("Error al consultar notas:", err);
      setError("Error al consultar las notas. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">
        Consulta de Calificaciones
      </h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">
          Ingresa tus credenciales
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Institucional
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="ejemplo@unsa.edu.pe"
                required
              />
            </div>

            <div>
              <label
                htmlFor="cui"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CUI
              </label>
              <input
                type="text"
                id="cui"
                value={cui}
                onChange={(e) => setCui(e.target.value)}
                className="input-field"
                placeholder="20201234"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                DNI
              </label>
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="input-field"
                placeholder="12345678"
                required
              />
            </div>
          </div>

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full md:w-auto"
            disabled={loadingNotas}
          >
            {loadingNotas ? "Consultando..." : "Consultar Calificaciones"}
          </button>
        </form>
      </div>

      {consultaRealizada && notas.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Tus Calificaciones
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
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
                  // Formatear la fecha para mostrar "Mayo/2025"
                  const fecha = (() => {
                    const fechaObj =
                      nota.fecha instanceof Date
                        ? nota.fecha
                        : nota.fecha?.toDate?.();
                    if (!fechaObj) return "Fecha desconocida";

                    const meses = [
                      "Enero",
                      "Febrero",
                      "Marzo",
                      "Abril",
                      "Mayo",
                      "Junio",
                      "Julio",
                      "Agosto",
                      "Septiembre",
                      "Octubre",
                      "Noviembre",
                      "Diciembre",
                    ];

                    const mes = meses[fechaObj.getMonth()];
                    const año = fechaObj.getFullYear();

                    return `${mes}/${año}`;
                  })();

                  // Determinar el estado y tipo de ausencia
                  const getEstadoInfo = () => {
                    if (nota.vacaciones) {
                      const tipoAusencia = nota.tipoAusencia || "Vacaciones";
                      return {
                        texto: tipoAusencia,
                        clase: "bg-yellow-100 text-yellow-800",
                      };
                    }
                    return {
                      texto: "Activo",
                      clase: "bg-green-100 text-green-800",
                    };
                  };

                  const estadoInfo = getEstadoInfo();

                  return (
                    <tr key={nota.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.rotacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.hospital}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full ${estadoInfo.clase}`}
                        >
                          {estadoInfo.texto}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {consultaRealizada && notas.length === 0 && !error && (
        <div className="card text-center py-8">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No hay calificaciones disponibles
          </h3>
          <p className="mt-1 text-gray-500">
            No se encontraron calificaciones registradas para este residente.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultaNotas;
