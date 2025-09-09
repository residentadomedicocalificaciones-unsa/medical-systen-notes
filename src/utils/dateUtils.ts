export const getMesesProceso = (fechaInicio: Date, duracionMeses: number) => {
  const meses = [];

  for (let i = 0; i < duracionMeses; i++) {
    const fecha = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth() + i,
      1
    );
    meses.push({
      numero: i + 1,
      fecha: fecha,
      nombre: formatearMesAño(fecha),
    });
  }

  return meses;
};

export const getMesNombrePorNumero = (numeroMes: number, fechaInicio: Date) => {
  const fecha = new Date(
    fechaInicio.getFullYear(),
    fechaInicio.getMonth() + (numeroMes - 1),
    1
  );
  return formatearMesAño(fecha);
};

const formatearMesAño = (fecha: Date) => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const mesNombre = meses[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${mesNombre} ${año}`;
};

export const calcularDiferenciaMeses = (
  fechaInicio: Date,
  fechaFin: Date
): number => {
  const añoInicio = fechaInicio.getFullYear();
  const mesInicio = fechaInicio.getMonth();
  const añoFin = fechaFin.getFullYear();
  const mesFin = fechaFin.getMonth();

  return (añoFin - añoInicio) * 12 + (mesFin - mesInicio) + 1;
};

export const formatearFecha = (fecha: Date | any): string => {
  if (!fecha) return "";

  let fechaObj: Date;

  if (fecha.toDate && typeof fecha.toDate === "function") {
    fechaObj = fecha.toDate();
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    return "";
  }

  return fechaObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatearFechaHora = (fecha: Date | any): string => {
  if (!fecha) return "";

  let fechaObj: Date;

  if (fecha.toDate && typeof fecha.toDate === "function") {
    fechaObj = fecha.toDate();
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    return "";
  }

  return fechaObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
