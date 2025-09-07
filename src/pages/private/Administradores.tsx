"use client";

import type React from "react";
import { useState } from "react";
import { useAdministradores } from "../../hooks";
import { useAuth } from "../../context/AuthContext";

const Administradores = () => {
  const { currentUser } = useAuth();
  const {
    getAllWithDetails,
    getPending,
    addAdmin,
    removeAdmin,
    removePendingAdmin,
  } = useAdministradores(currentUser?.uid);

  const { data: administradores = [], isLoading } = getAllWithDetails;
  const { data: administradoresPendientes = [], isLoading: loadingPending } =
    getPending;

  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSuccessMessage("");
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("El formato del correo electrónico no es válido");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const result = await addAdmin.mutateAsync(email.trim());

      setEmail("");

      if (result.isPending) {
        showSuccess(
          "Usuario agregado como administrador pendiente. Se activará cuando inicie sesión por primera vez."
        );
      } else {
        showSuccess("Usuario agregado como administrador exitosamente.");
      }
    } catch (error: any) {
      console.error("Error al agregar administrador:", error);
      setError(
        error.message ||
          "Error al agregar el administrador. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActive = async (id: string, nombre: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar a ${nombre} como administrador? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await removeAdmin.mutateAsync(id);
      showSuccess("Administrador eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar administrador:", error);
      setError("Error al eliminar el administrador");
    }
  };

  const handleDeletePending = async (email: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar la invitación de administrador para ${email}?`
      )
    ) {
      return;
    }

    try {
      await removePendingAdmin.mutateAsync(email);
      showSuccess("Invitación de administrador cancelada exitosamente.");
    } catch (error) {
      console.error("Error al cancelar invitación:", error);
      setError("Error al cancelar la invitación");
    }
  };

  if (isLoading || loadingPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestión de Administradores
      </h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Agregar Nuevo Administrador
        </h2>

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
            role="alert"
          >
            <p>{successMessage}</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field max-w-md"
              placeholder="ejemplo@gmail.com"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el correo electrónico del usuario que deseas hacer
              administrador
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || addAdmin.isPending}
          >
            {isSubmitting || addAdmin.isPending
              ? "Agregando..."
              : "Agregar Administrador"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            ¿Cómo funciona?
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • Si el usuario ya ha iniciado sesión antes, se convertirá en
              administrador inmediatamente
            </li>
            <li>
              • Si el usuario nunca ha iniciado sesión, quedará como "pendiente"
              hasta que lo haga
            </li>
            <li>
              • El usuario debe usar Google para iniciar sesión con el correo
              especificado
            </li>
            <li>
              • Solo usuarios con permisos de administrador pueden acceder al
              panel administrativo
            </li>
          </ul>
        </div>
      </div>

      {/* Administradores Pendientes */}
      {administradoresPendientes.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Administradores Pendientes
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Estos usuarios fueron invitados como administradores pero aún no
              han iniciado sesión en el sistema.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Invitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {administradoresPendientes.map((admin) => {
                  const fechaCreacion =
                    admin.createdAt instanceof Date
                      ? admin.createdAt.toLocaleDateString()
                      : admin.createdAt?.toDate?.().toLocaleDateString() ||
                        "Fecha desconocida";

                  return (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fechaCreacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeletePending(admin.email!)}
                          className="text-red-600 hover:text-red-900"
                          disabled={removePendingAdmin.isPending}
                        >
                          {removePendingAdmin.isPending
                            ? "Cancelando..."
                            : "Cancelar Invitación"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Administradores Activos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Administradores Activos
        </h2>

        {administradores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {administradores.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.photoURL ? (
                          <img
                            src={admin.photoURL || "/placeholder.svg"}
                            alt={admin.nombre}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white mr-3">
                            {admin.nombre[0].toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {admin.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {admin.id !== currentUser?.uid && (
                        <button
                          onClick={() =>
                            handleDeleteActive(admin.id!, admin.nombre)
                          }
                          className="text-red-600 hover:text-red-900"
                          disabled={removeAdmin.isPending}
                        >
                          {removeAdmin.isPending ? "Eliminando..." : "Eliminar"}
                        </button>
                      )}
                      {admin.id === currentUser?.uid && (
                        <span className="text-gray-400 text-xs">Tú mismo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">
            No hay administradores activos registrados.
          </p>
        )}
      </div>
    </div>
  );
};

export default Administradores;
