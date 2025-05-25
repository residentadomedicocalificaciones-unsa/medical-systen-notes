"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sedeService } from "../services"
import type { Sede } from "../types"

export const useSedes = () => {
  const queryClient = useQueryClient()

  // Obtener todas las sedes
  const getAllQuery = useQuery({
    queryKey: ["sedes"],
    queryFn: () => sedeService.getAll(),
  })

  // Obtener todas las sedes ordenadas por nombre
  const getAllOrdenadasQuery = useQuery({
    queryKey: ["sedes", "ordenadas"],
    queryFn: () => sedeService.getAllOrdenadas(),
  })

  // Crear una nueva sede
  const create = useMutation({
    mutationFn: (data: Omit<Sede, "id">) => sedeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sedes"] })
    },
  })

  // Actualizar una sede
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sede> }) => sedeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sedes"] })
      queryClient.invalidateQueries({ queryKey: ["sedes", variables.id] })
    },
  })

  // Eliminar una sede
  const remove = useMutation({
    mutationFn: (id: string) => sedeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sedes"] })
    },
  })

  const getAll = () => getAllQuery
  const getAllOrdenadas = () => getAllOrdenadasQuery

  const getById = (id: string | undefined) => {
    return useQuery({
      queryKey: ["sedes", id],
      queryFn: () => (id ? sedeService.getById(id) : Promise.resolve(null)),
      enabled: !!id,
    })
  }

  return {
    getAll,
    getAllOrdenadas,
    getById,
    create,
    update,
    remove,
  }
}
