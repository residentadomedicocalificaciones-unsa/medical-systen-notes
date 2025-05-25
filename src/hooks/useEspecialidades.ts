"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { especialidadService } from "../services"
import type { Especialidad } from "../types"
import React from "react"

export const useEspecialidades = () => {
  const queryClient = useQueryClient()

  // Obtener todas las especialidades
  const getAllQuery = useQuery({
    queryKey: ["especialidades"],
    queryFn: () => especialidadService.getAll(),
  })

  // Obtener todas las especialidades ordenadas por nombre
  const getAllOrdenadasQuery = useQuery({
    queryKey: ["especialidades", "ordenadas"],
    queryFn: () => especialidadService.getAllOrdenadas(),
  })

  // Crear una nueva especialidad
  const create = useMutation({
    mutationFn: (data: Omit<Especialidad, "id">) => especialidadService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialidades"] })
    },
  })

  // Actualizar una especialidad
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Especialidad> }) => especialidadService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["especialidades"] })
      queryClient.invalidateQueries({ queryKey: ["especialidades", variables.id] })
    },
  })

  // Eliminar una especialidad
  const remove = useMutation({
    mutationFn: (id: string) => especialidadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialidades"] })
    },
  })

  // Obtener una especialidad por ID
  const [getByIdQuery, setByIdQuery] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchById = async (id: string | undefined) => {
      if (id) {
        const result = await especialidadService.getById(id)
        setByIdQuery(result)
      } else {
        setByIdQuery(null)
      }
    }

    if (getByIdQuery?.id) {
      fetchById(getByIdQuery?.id)
    }
  }, [getByIdQuery])

  const getAll = () => getAllQuery
  const getAllOrdenadas = () => getAllOrdenadasQuery

  return {
    getAll,
    getAllOrdenadas,
    getByIdQuery,
    create,
    update,
    remove,
  }
}
