"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { administradorService } from "../services";
import { useMemo } from "react";

export const useAdministradores = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Obtener todos los administradores con detalles
  const getAllWithDetailsQuery = useQuery({
    queryKey: ["administradores", "details"],
    queryFn: () => administradorService.getAllAdminsWithDetails(),
  });

  // Obtener administradores pendientes
  const getPendingQuery = useQuery({
    queryKey: ["administradores", "pending"],
    queryFn: () => administradorService.getPendingAdmins(),
  });

  // Verificar si un usuario es administrador
  const isAdminQuery = useQuery({
    queryKey: ["administradores", "isAdmin", userId],
    queryFn: () =>
      userId ? administradorService.isAdmin(userId) : Promise.resolve(false),
    enabled: !!userId,
  });

  // Agregar un nuevo administrador
  const addAdmin = useMutation({
    mutationFn: (email: string) => administradorService.addAdmin(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administradores"] });
    },
  });

  // Eliminar un administrador activo
  const removeAdmin = useMutation({
    mutationFn: (id: string) => administradorService.removeAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administradores"] });
    },
  });

  // Eliminar un administrador pendiente
  const removePendingAdmin = useMutation({
    mutationFn: (email: string) =>
      administradorService.removePendingAdminByEmail(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administradores"] });
    },
  });

  const getAllWithDetails = useMemo(
    () => getAllWithDetailsQuery,
    [getAllWithDetailsQuery]
  );
  const getPending = useMemo(() => getPendingQuery, [getPendingQuery]);
  const isAdmin = useMemo(() => isAdminQuery, [isAdminQuery]);

  return {
    getAllWithDetails,
    getPending,
    isAdmin,
    addAdmin,
    removeAdmin,
    removePendingAdmin,
  };
};
