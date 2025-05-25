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

  // Obtener residentes por especialidad ID
  const getByEspecialidadIdQuery = useCallback((especialidadId: string) => {
    return {
      queryKey: ["residentes", "especialidad", especialidadId],
      queryFn: () => residenteService.getByEspecialidadId(especialidadId),
      enabled: !!especialidadId,
    }
  }, [])

  // Obtener residentes por sede de rotación
  const getBySedeRotacionQuery = useCallback((sedeRotacionId: string) => {
    return {
      queryKey: ["residentes", "sedeRotacion", sedeRotacionId],
      queryFn: () => residenteService.getBySedeRotacion(sedeRotacionId),
      enabled: !!sedeRotacionId,
    }
  }, [])

  // Obtener residentes por año académico
  const getByAnioAcademicoQuery = useCallback((anio: string) => {
    return {
      queryKey: ["residentes", "anioAcademico", anio],
      queryFn: () => residenteService.getByAnioAcademico(anio),
      enabled: !!anio,
    }
  }, [])

  // Obtener residentes por año de ingreso
  const getByAnioIngresoQuery = useCallback((anio: string) => {
    return {
      queryKey: ["residentes", "anioIngreso", anio],
      queryFn: () => residenteService.getByAnioIngreso(anio),
      enabled: !!anio,
    }
  }, [])

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

  const residentesQueries = {
    getAllQuery,
    getByIdQuery,
    getByEspecialidadIdQuery,
    getBySedeRotacionQuery,
    getByAnioAcademicoQuery,
    getByAnioIngresoQuery,
    checkDuplicatesQuery,
  }

  return {
    getAll,
    getById: (id: string | undefined) => queryClient.getQueryData(["residentes", id]),
    getByEspecialidadId: (especialidadId: string) =>
      queryClient.getQueryData(["residentes", "especialidad", especialidadId]),
    getBySedeRotacion: (sedeRotacionId: string) =>
      queryClient.getQueryData(["residentes", "sedeRotacion", sedeRotacionId]),
    getByAnioAcademico: (anio: string) => queryClient.getQueryData(["residentes", "anioAcademico", anio]),
    getByAnioIngreso: (anio: string) => queryClient.getQueryData(["residentes", "anioIngreso", anio]),
    create,
    update,
    remove,
    checkDuplicates: (email: string, cui: string, dni: string, excludeId?: string) =>
      queryClient.getQueryData(["residentes", "duplicates", email, cui, dni, excludeId]),
    residentesQueries,
  }
}
