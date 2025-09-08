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

export const formatearFecha = (fecha: Date | any) => {
  if (!fecha) return "";

  const fechaObj = fecha instanceof Date ? fecha : fecha.toDate();
  return fechaObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const calcularDiferenciaMeses = (fechaInicio: Date, fechaFin: Date) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const años = fin.getFullYear() - inicio.getFullYear();
  const meses = fin.getMonth() - inicio.getMonth();

  return años * 12 + meses;
};
