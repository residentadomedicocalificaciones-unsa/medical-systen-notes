"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { administradorService } from "../services"
import { useMemo } from "react"

export const useAdministradores = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  // Obtener todos los administradores con detalles
  const getAllWithDetailsQuery = useQuery({
    queryKey: ["administradores", "details"],
    queryFn: () => administradorService.getAllAdminsWithDetails(),
  })

  // Verificar si un usuario es administrador
  const isAdminQuery = useQuery({
    queryKey: ["administradores", "isAdmin", userId],
    queryFn: () => (userId ? administradorService.isAdmin(userId) : Promise.resolve(false)),
    enabled: !!userId,
  })

  // Agregar un nuevo administrador
  const addAdmin = useMutation({
    mutationFn: (email: string) => administradorService.addAdmin(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administradores"] })
    },
  })

  // Eliminar un administrador
  const removeAdmin = useMutation({
    mutationFn: (id: string) => administradorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administradores"] })
    },
  })

  const getAllWithDetails = useMemo(() => getAllWithDetailsQuery, [getAllWithDetailsQuery])
  const isAdmin = useMemo(() => isAdminQuery, [isAdminQuery])

  return {
    getAllWithDetails,
    isAdmin,
    addAdmin,
    removeAdmin,
  }
}
