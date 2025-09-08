"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { procesoResidentadoService } from "../services/proceso-residentado.service";
import type { ProcesoResidentado } from "../types";

export const useProcesosResidentado = () => {
  const queryClient = useQueryClient();

  // Query para obtener todos los procesos
  const getAll = useQuery({
    queryKey: ["procesos-residentado"],
    queryFn: () => procesoResidentadoService.getAll(),
  });

  // Query para obtener procesos con detalles
  const getConDetalles = useQuery({
    queryKey: ["procesos-residentado", "con-detalles"],
    queryFn: () => procesoResidentadoService.getConDetalles(),
  });

  // Query para obtener procesos activos
  const getActivos = useQuery({
    queryKey: ["procesos-residentado", "activos"],
    queryFn: () => procesoResidentadoService.getProcesosActivos(),
  });

  // Hook para obtener un proceso por ID
  const useGetById = (id?: string) => {
    return useQuery({
      queryKey: ["procesos-residentado", id],
      queryFn: () => procesoResidentadoService.getById(id!),
      enabled: !!id,
    });
  };

  // Mutation para crear proceso
  const create = useMutation({
    mutationFn: (
      data: Omit<ProcesoResidentado, "id" | "createdAt" | "updatedAt">
    ) => procesoResidentadoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-residentado"] });
    },
  });

  // Mutation para actualizar proceso
  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProcesoResidentado>;
    }) => procesoResidentadoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-residentado"] });
    },
  });

  // Mutation para eliminar proceso
  const remove = useMutation({
    mutationFn: (id: string) => procesoResidentadoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-residentado"] });
    },
  });

  return {
    getAll,
    getConDetalles,
    getActivos,
    useGetById,
    create,
    update,
    remove,
  };
};
