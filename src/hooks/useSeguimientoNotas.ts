import { useQuery } from "@tanstack/react-query";
import { notaService } from "../services/nota.service";

export const useSeguimientoNotas = () => {
  // Hook para obtener seguimiento completo de un proceso
  const useSeguimientoProceso = (procesoId: string | undefined) => {
    return useQuery({
      queryKey: ["seguimiento-proceso", procesoId],
      queryFn: () =>
        procesoId
          ? notaService.getSeguimientoProceso(procesoId)
          : Promise.resolve(null),
      enabled: !!procesoId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    });
  };

  // Hook para obtener notas pendientes de un residente
  const useNotasPendientesResidente = (
    procesoId: string | undefined,
    residenteId: string | undefined
  ) => {
    return useQuery({
      queryKey: ["notas-pendientes-residente", procesoId, residenteId],
      queryFn: () =>
        procesoId && residenteId
          ? notaService.getNotasPendientesPorResidente(procesoId, residenteId)
          : Promise.resolve([]),
      enabled: !!procesoId && !!residenteId,
      staleTime: 1000 * 60 * 2, // 2 minutos
    });
  };

  // Hook para obtener resumen de notas de un residente
  const useResumenNotasResidente = (
    procesoId: string | undefined,
    residenteId: string | undefined
  ) => {
    return useQuery({
      queryKey: ["resumen-notas-residente", procesoId, residenteId],
      queryFn: () =>
        procesoId && residenteId
          ? notaService.getResumenNotasResidente(procesoId, residenteId)
          : Promise.resolve(null),
      enabled: !!procesoId && !!residenteId,
      staleTime: 1000 * 60 * 2, // 2 minutos
    });
  };

  // Hook para validar si existe una nota
  const useValidarNotaExistente = (
    procesoId: string | undefined,
    residenteId: string | undefined,
    mes: number | undefined
  ) => {
    return useQuery({
      queryKey: ["validar-nota-existente", procesoId, residenteId, mes],
      queryFn: () =>
        procesoId && residenteId && mes && mes > 0
          ? notaService.validarNotaExistente(procesoId, residenteId, mes)
          : Promise.resolve(null),
      enabled: !!procesoId && !!residenteId && !!mes && mes > 0,
      staleTime: 1000 * 10, // 10 segundos para validación más frecuente
      refetchOnWindowFocus: true, // Revalidar al enfocar la ventana
    });
  };

  return {
    useSeguimientoProceso,
    useNotasPendientesResidente,
    useResumenNotasResidente,
    useValidarNotaExistente,
  };
};
