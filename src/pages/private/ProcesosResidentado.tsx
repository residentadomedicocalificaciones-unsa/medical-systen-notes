"use client";

import type React from "react";
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  GraduationCap,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useProcesosResidentado } from "../../hooks/useProcesosResidentado";
import { useInscripcionesProceso } from "../../hooks/useInscripcionesProceso";
import type { ProcesoResidentado } from "../../types";

export default function ProcesosResidentado() {
  const [showForm, setShowForm] = useState(false);
  const [editingProceso, setEditingProceso] =
    useState<ProcesoResidentado | null>(null);
  const [selectedProceso, setSelectedProceso] = useState<string | null>(null);
  const [showInscripciones, setShowInscripciones] = useState(false);

  // Hooks principales
  const { getConDetalles, create, update, remove } = useProcesosResidentado();
  const {
    useGetInscripcionesConDetalles,
    useGetResidentesDisponibles,
    inscribir,
    desinscribir,
  } = useInscripcionesProceso();

  // Queries principales
  const procesosQuery = getConDetalles;

  // Queries condicionales para inscripciones
  const procesoSeleccionado = procesosQuery.data?.find(
    (p) => p.id === selectedProceso
  );
  const inscripcionesQuery = useGetInscripcionesConDetalles(
    selectedProceso || undefined
  );
  const residentesDisponiblesQuery = useGetResidentesDisponibles(
    selectedProceso || undefined,
    procesoSeleccionado?.anioAcademico
  );

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    anioAcademico: "",
    fechaInicio: "",
    fechaFin: "",
    duracionMeses: 12,
    activo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const procesoData = {
        ...formData,
        fechaInicio: new Date(formData.fechaInicio + "T00:00:00"),
        fechaFin: new Date(formData.fechaFin + "T00:00:00"),
      };

      if (editingProceso) {
        await update.mutateAsync({
          id: editingProceso.id!,
          data: procesoData,
        });
      } else {
        await create.mutateAsync(procesoData);
      }
      resetForm();
    } catch (error: any) {
      console.error("Error al guardar proceso:", error);
      alert(error.message || "Error al guardar el proceso");
    }
  };

  const handleEdit = (proceso: any) => {
    setEditingProceso(proceso);
    setFormData({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion || "",
      anioAcademico: proceso.anioAcademico,
      fechaInicio:
        proceso.fechaInicio instanceof Date
          ? proceso.fechaInicio.toISOString().split("T")[0]
          : proceso.fechaInicio?.toDate?.().toISOString().split("T")[0] || "",
      fechaFin:
        proceso.fechaFin instanceof Date
          ? proceso.fechaFin.toISOString().split("T")[0]
          : proceso.fechaFin?.toDate?.().toISOString().split("T")[0] || "",
      duracionMeses: proceso.duracionMeses || 12,
      activo: proceso.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este proceso?")) {
      try {
        await remove.mutateAsync(id);
      } catch (error) {
        console.error("Error al eliminar proceso:", error);
        alert("Error al eliminar el proceso");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      anioAcademico: "",
      fechaInicio: "",
      fechaFin: "",
      duracionMeses: 12,
      activo: true,
    });
    setEditingProceso(null);
    setShowForm(false);
  };

  const handleInscribir = async (residenteId: string) => {
    if (!selectedProceso) return;
    try {
      await inscribir.mutateAsync({
        procesoId: selectedProceso,
        residenteId,
      });
    } catch (error: any) {
      console.error("Error al inscribir residente:", error);
      alert(error.message || "Error al inscribir residente");
    }
  };

  const handleDesinscribir = async (residenteId: string) => {
    if (!selectedProceso) return;
    if (!window.confirm("¿Está seguro de desinscribir a este residente?"))
      return;

    try {
      await desinscribir.mutateAsync({
        procesoId: selectedProceso,
        residenteId,
      });
    } catch (error) {
      console.error("Error al desinscribir residente:", error);
      alert("Error al desinscribir residente");
    }
  };

  const handleVerInscripciones = (procesoId: string) => {
    setSelectedProceso(procesoId);
    setShowInscripciones(true);
  };

  if (procesosQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (showInscripciones && selectedProceso) {
    const rootKey =
      showInscripciones && selectedProceso ? `insc-${selectedProceso}` : "list";
    const proceso = procesosQuery.data?.find((p) => p.id === selectedProceso);
    const inscripciones = inscripcionesQuery.data || [];
    const residentesDisponibles = residentesDisponiblesQuery.data || [];

    return (
      <div key={rootKey} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Inscripciones
            </h1>
            <p className="text-gray-600">
              Proceso: {proceso?.nombre} - {proceso?.anioAcademico}° Año
            </p>
          </div>
          <button
            onClick={() => setShowInscripciones(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Residentes Inscritos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-700">
              Residentes Inscritos ({inscripciones.length})
            </h2>
            {inscripcionesQuery.isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inscripciones.map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="flex justify-between items-center p-3 bg-green-50 rounded-md"
                  >
                    <div>
                      <span className="font-medium">
                        {inscripcion.residenteNombre}
                      </span>
                      <div className="text-xs text-gray-500">
                        ID: {inscripcion.residenteId}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleDesinscribir(inscripcion.residenteId)
                      }
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Desinscribir"
                      disabled={desinscribir.isPending}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {inscripciones.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay residentes inscritos
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Residentes Disponibles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">
              Residentes Disponibles ({residentesDisponibles.length})
            </h2>
            {residentesDisponiblesQuery.isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {residentesDisponibles.map((residente) => (
                  <div
                    key={residente.id}
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-md"
                  >
                    <div>
                      <span className="font-medium">{residente.nombre}</span>
                      <div className="text-xs text-gray-500">
                        CUI: {residente.cui}
                      </div>
                    </div>
                    <button
                      onClick={() => handleInscribir(residente.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Inscribir"
                      disabled={inscribir.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {residentesDisponibles.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay residentes disponibles
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Procesos de Residentado
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proceso
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingProceso ? "Editar Proceso" : "Nuevo Proceso"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proceso *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Residentado 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año Académico *
                </label>
                <select
                  value={formData.anioAcademico}
                  onChange={(e) =>
                    setFormData({ ...formData, anioAcademico: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar año</option>
                  {Array.from({ length: 7 }, (_, i) => (i + 1).toString()).map(
                    (anio) => (
                      <option key={anio} value={anio}>
                        {anio}° Año
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descripción opcional del proceso..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaFin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (meses) *
                </label>
                <input
                  type="number"
                  value={formData.duracionMeses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duracionMeses: Number.parseInt(e.target.value) || 12,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="60"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  La diferencia entre fechas debe ser al menos{" "}
                  {formData.duracionMeses - 1} meses
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="activo"
                className="ml-2 block text-sm text-gray-900"
              >
                Proceso activo
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {create.isPending || update.isPending
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año Académico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {procesosQuery.data?.map((proceso) => {
                const fechaInicio =
                  proceso.fechaInicio instanceof Date
                    ? proceso.fechaInicio.toLocaleDateString()
                    : proceso.fechaInicio?.toDate?.().toLocaleDateString() ||
                      "No definida";

                const fechaFin =
                  proceso.fechaFin instanceof Date
                    ? proceso.fechaFin.toLocaleDateString()
                    : proceso.fechaFin?.toDate?.().toLocaleDateString() ||
                      "No definida";

                return (
                  <tr key={proceso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {proceso.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {proceso.anioAcademico}° Año
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {fechaInicio} - {fechaFin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proceso.duracionMeses} meses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          proceso.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {proceso.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleVerInscripciones(proceso.id!)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver inscripciones"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(proceso)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(proceso.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {procesosQuery.data?.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay procesos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comience creando un nuevo proceso de residentado.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proceso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
