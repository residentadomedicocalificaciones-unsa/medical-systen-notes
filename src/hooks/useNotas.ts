"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notaService } from "../services"
import type { Nota } from "../types"
import { useCallback } from "react"

export const useNotas = () => {
  const queryClient = useQueryClient()

  const getAllQuery = useQuery({
    queryKey: ["notas"],
    queryFn: () => notaService.getAll(),
  })

  const getByIdQuery = (id: string | undefined) => {
    return useQuery({
      queryKey: ["notas", id],
      queryFn: () => (id ? notaService.getById(id) : Promise.resolve(null)),
      enabled: !!id,
    })
  }

  const getByResidenteIdQuery = (residenteId: string | undefined) => {
    return useQuery({
      queryKey: ["notas", "residente", residenteId],
      queryFn: () => (residenteId ? notaService.getByResidenteId(residenteId) : Promise.resolve([])),
      enabled: !!residenteId,
    })
  }

  const getLatestNotasQuery = (limit = 5) => {
    return useQuery({
      queryKey: ["notas", "latest", limit],
      queryFn: () => notaService.getLatestNotas(limit),
    })
  }

  const getByHospitalQuery = (hospital: string) => {
    return useQuery({
      queryKey: ["notas", "hospital", hospital],
      queryFn: () => notaService.getByHospital(hospital),
      enabled: !!hospital,
    })
  }

  const getByRotacionQuery = (rotacion: string) => {
    return useQuery({
      queryKey: ["notas", "rotacion", rotacion],
      queryFn: () => notaService.getByRotacion(rotacion),
      enabled: !!rotacion,
    })
  }

  const getEstadisticasPorEspecialidadQuery = () => {
    return useQuery({
      queryKey: ["notas", "estadisticas", "especialidad"],
      queryFn: () => notaService.getEstadisticasPorEspecialidad(),
    })
  }

  // Crear una nueva nota
  const create = useMutation({
    mutationFn: (data: Omit<Nota, "id">) => notaService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notas"] })
      if (variables.residenteId) {
        queryClient.invalidateQueries({ queryKey: ["notas", "residente", variables.residenteId] })
      }
    },
  })

  // Actualizar una nota
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Nota> }) => notaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notas"] })
      queryClient.invalidateQueries({ queryKey: ["notas", variables.id] })
      if (variables.data.residenteId) {
        queryClient.invalidateQueries({ queryKey: ["notas", "residente", variables.data.residenteId] })
      }
    },
  })

  // Eliminar una nota
  const remove = useMutation({
    mutationFn: (id: string) => notaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] })
    },
  })

  const getAll = useCallback(() => {
    return {
      query: getAllQuery,
    }
  }, [getAllQuery])

  const getById = useCallback(
    (id: string | undefined) => {
      return {
        query: getByIdQuery(id),
      }
    },
    [getByIdQuery],
  )

  const getByResidenteId = useCallback(
    (residenteId: string | undefined) => {
      return {
        query: getByResidenteIdQuery(residenteId),
      }
    },
    [getByResidenteIdQuery],
  )

  const getLatestNotas = useCallback(
    (limit = 5) => {
      return {
        query: getLatestNotasQuery(limit),
      }
    },
    [getLatestNotasQuery],
  )

  const getByHospital = useCallback(
    (hospital: string) => {
      return {
        query: getByHospitalQuery(hospital),
      }
    },
    [getByHospitalQuery],
  )

  const getByRotacion = useCallback(
    (rotacion: string) => {
      return {
        query: getByRotacionQuery(rotacion),
      }
    },
    [getByRotacionQuery],
  )

  const getEstadisticasPorEspecialidad = useCallback(() => {
    return {
      query: getEstadisticasPorEspecialidadQuery(),
    }
  }, [getEstadisticasPorEspecialidadQuery])

  return {
    getAll,
    getById,
    getByResidenteId,
    getLatestNotas,
    getByHospital,
    getByRotacion,
    getEstadisticasPorEspecialidad,
    create,
    update,
    remove,
  }
}
