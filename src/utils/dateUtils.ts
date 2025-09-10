export const formatearFecha = (fecha: Date | any): string => {
  if (!fecha) return "";

  const fechaObj = fecha instanceof Date ? fecha : fecha.toDate();
  return fechaObj.toLocaleDateString("es-ES");
};

export const getMesesProceso = (fechaInicio: Date, duracionMeses: number) => {
  const meses = [];
  const fecha = new Date(fechaInicio);

  for (let i = 0; i < duracionMeses; i++) {
    const mesActual = new Date(fecha.getFullYear(), fecha.getMonth() + i, 1);
    meses.push({
      numero: i + 1,
      fecha: mesActual,
      nombre: getMesNombrePorNumero(i + 1, fechaInicio),
    });
  }

  return meses;
};

export const getMesNombrePorNumero = (numeroMes: number, fechaInicio: Date) => {
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

  const fecha = new Date(fechaInicio);
  fecha.setMonth(fecha.getMonth() + (numeroMes - 1));

  const mesNombre = meses[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${mesNombre} ${año}`;
};

export const formatearMesAño = (fecha: Date): string => {
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

  return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
};

export const calcularDiferenciaMeses = (
  fechaInicio: Date,
  fechaFin: Date
): number => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const diffTime = fin.getTime() - inicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.ceil(diffDays / 30);

  return diffMonths + 1; // +1 para incluir el mes de inicio
};

export const obtenerMesActual = (): number => {
  return new Date().getMonth() + 1;
};

export const obtenerAñoActual = (): number => {
  return new Date().getFullYear();
};
