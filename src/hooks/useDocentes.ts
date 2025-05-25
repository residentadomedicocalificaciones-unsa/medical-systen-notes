"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { docenteService } from "../services"
import type { Docente } from "../types"

export const useDocentes = () => {
  const queryClient = useQueryClient()

  // Obtener todos los docentes
  const getAllQuery = useQuery({
    queryKey: ["docentes"],
    queryFn: () => docenteService.getAll(),
  })

  // Obtener todos los docentes ordenados por nombre
  const getAllOrdenadosQuery = useQuery({
    queryKey: ["docentes", "ordenados"],
    queryFn: () => docenteService.getAllOrdenados(),
  })

  // Obtener docentes habilitados
  const getHabilitadosQuery = useQuery({
    queryKey: ["docentes", "habilitados"],
    queryFn: () => docenteService.getHabilitados(),
  })

  // Crear un nuevo docente
  const create = useMutation({
    mutationFn: (data: Omit<Docente, "id">) => docenteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] })
    },
  })

  // Actualizar un docente
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Docente> }) => docenteService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] })
      queryClient.invalidateQueries({ queryKey: ["docentes", variables.id] })
    },
  })

  // Eliminar un docente
  const remove = useMutation({
    mutationFn: (id: string) => docenteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] })
    },
  })

  // Obtener docentes por sede
  const getBySedeQuery = (sedeId: string) => {
    return {
      queryKey: ["docentes", "sede", sedeId],
      queryFn: () => docenteService.getBySede(sedeId),
      enabled: !!sedeId,
    }
  }

  // Obtener docentes habilitados por sede
  const getHabilitadosBySedeQuery = (sedeId: string) => {
    return {
      queryKey: ["docentes", "sede", sedeId, "habilitados"],
      queryFn: () => docenteService.getHabilitadosBySede(sedeId),
      enabled: !!sedeId,
    }
  }

  const getAll = () => getAllQuery
  const getAllOrdenados = () => getAllOrdenadosQuery
  const getHabilitados = () => getHabilitadosQuery
  const getBySede = (sedeId: string) => useQuery(getBySedeQuery(sedeId))
  const getHabilitadosBySede = (sedeId: string) => useQuery(getHabilitadosBySedeQuery(sedeId))

  return {
    getAll,
    getAllOrdenados,
    getHabilitados,
    getBySede,
    getHabilitadosBySede,
    create,
    update,
    remove,
  }
}
