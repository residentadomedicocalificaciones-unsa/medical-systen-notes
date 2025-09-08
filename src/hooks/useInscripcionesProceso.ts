"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inscripcionProcesoService } from "../services/inscripcion-proceso.service";

export const useInscripcionesProceso = () => {
  const queryClient = useQueryClient();

  // Hook para obtener inscripciones por proceso ID
  const useGetByProcesoId = (procesoId?: string) => {
    return useQuery({
      queryKey: ["inscripciones-proceso", "by-proceso", procesoId],
      queryFn: () => inscripcionProcesoService.getByProcesoId(procesoId!),
      enabled: !!procesoId,
    });
  };

  // Hook para obtener inscripciones por residente ID
  const useGetByResidenteId = (residenteId?: string) => {
    return useQuery({
      queryKey: ["inscripciones-proceso", "by-residente", residenteId],
      queryFn: () => inscripcionProcesoService.getByResidenteId(residenteId!),
      enabled: !!residenteId,
    });
  };

  // Hook para obtener inscripciones con detalles
  const useGetInscripcionesConDetalles = (procesoId?: string) => {
    return useQuery({
      queryKey: ["inscripciones-proceso", "con-detalles", procesoId],
      queryFn: () =>
        inscripcionProcesoService.getInscripcionesConDetalles(procesoId),
      enabled: true,
    });
  };

  // Hook para obtener residentes disponibles
  const useGetResidentesDisponibles = (
    procesoId?: string,
    anioAcademico?: string
  ) => {
    return useQuery({
      queryKey: [
        "inscripciones-proceso",
        "residentes-disponibles",
        procesoId,
        anioAcademico,
      ],
      queryFn: () =>
        inscripcionProcesoService.getResidentesDisponibles(
          procesoId!,
          anioAcademico!
        ),
      enabled: !!procesoId && !!anioAcademico,
    });
  };

  // Mutación para inscribir residente
  const inscribir = useMutation({
    mutationFn: ({
      procesoId,
      residenteId,
    }: {
      procesoId: string;
      residenteId: string;
    }) => inscripcionProcesoService.inscribirResidente(procesoId, residenteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones-proceso"] });
      queryClient.invalidateQueries({ queryKey: ["procesos-residentado"] });
    },
  });

  // Mutación para desinscribir residente
  const desinscribir = useMutation({
    mutationFn: ({
      procesoId,
      residenteId,
    }: {
      procesoId: string;
      residenteId: string;
    }) =>
      inscripcionProcesoService.desinscribirResidente(procesoId, residenteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones-proceso"] });
      queryClient.invalidateQueries({ queryKey: ["procesos-residentado"] });
    },
  });

  return {
    useGetByProcesoId,
    useGetByResidenteId,
    useGetInscripcionesConDetalles,
    useGetResidentesDisponibles,
    inscribir,
    desinscribir,
  };
};
