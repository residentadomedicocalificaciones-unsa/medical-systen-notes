"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { residenteService } from "../services"
import type { Residente } from "../types"
import { useCallback } from "react"

export const useResidentes = () => {
  const queryClient = useQueryClient()

  // Obtener todos los residentes
  const getAllQuery = useQuery({
    queryKey: ["residentes"],
    queryFn: () => residenteService.getAll(),
  })

  const getAll = () => {
    return getAllQuery
  }

  // Obtener un residente por ID
  const getByIdQuery = useCallback((id: string | undefined) => {
    return {
      queryKey: ["residentes", id],
      queryFn: () => (id ? residenteService.getById(id) : Promise.resolve(null)),
      enabled: !!id,
    }
  }, [])

  const getById = (id: string | undefined) => {
    return useQuery(getByIdQuery(id))
  }

  // Obtener residentes por especialidad
  const getByEspecialidadQuery = useCallback((especialidad: string) => {
    return {
      queryKey: ["residentes", "especialidad", especialidad],
      queryFn: () => residenteService.getByEspecialidad(especialidad),
      enabled: !!especialidad,
    }
  }, [])

  const getByEspecialidad = (especialidad: string) => {
    return useQuery(getByEspecialidadQuery(especialidad))
  }

  // Obtener residentes por año académico
  const getByAnioAcademicoQuery = useCallback((anio: string) => {
    return {
      queryKey: ["residentes", "anioAcademico", anio],
      queryFn: () => residenteService.getByAnioAcademico(anio),
      enabled: !!anio,
    }
  }, [])

  const getByAnioAcademico = (anio: string) => {
    return useQuery(getByAnioAcademicoQuery(anio))
  }

  // Crear un nuevo residente
  const create = useMutation({
    mutationFn: (data: Omit<Residente, "id">) => residenteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentes"] })
    },
  })

  // Actualizar un residente
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Residente> }) => residenteService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["residentes"] })
      queryClient.invalidateQueries({ queryKey: ["residentes", variables.id] })
    },
  })

  // Eliminar un residente
  const remove = useMutation({
    mutationFn: (id: string) => residenteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentes"] })
    },
  })

  // Verificar duplicados
  const checkDuplicatesQuery = useCallback((email: string, cui: string, dni: string, excludeId?: string) => {
    return {
      queryKey: ["residentes", "duplicates", email, cui, dni, excludeId],
      queryFn: () => residenteService.checkDuplicates(email, cui, dni, excludeId),
      enabled: !!(email && cui && dni),
    }
  }, [])

  const checkDuplicates = (email: string, cui: string, dni: string, excludeId?: string) => {
    return useQuery(checkDuplicatesQuery(email, cui, dni, excludeId))
  }

  return {
    getAll,
    getById,
    getByEspecialidad,
    getByAnioAcademico,
    create,
    update,
    remove,
    checkDuplicates,
  }
}
