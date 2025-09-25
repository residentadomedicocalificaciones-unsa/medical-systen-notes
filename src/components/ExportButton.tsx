"use client";

import type React from "react";
import { useExcelExport } from "../hooks/useExcelExport";
import type { ProcesoResidentado, Residente } from "../types";

interface ExportButtonProps {
  proceso?: ProcesoResidentado;
  residentes?: Residente[];
  residente?: Residente;
  variant?: "proceso" | "residente";
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  proceso,
  residentes = [],
  residente,
  variant = "proceso",
  className = "",
}) => {
  const { exportarNotasProceso, exportarNotasResidente, isExporting, error } =
    useExcelExport();

  const handleExport = async () => {
    if (variant === "proceso" && proceso) {
      await exportarNotasProceso(proceso, residentes);
    } else if (variant === "residente" && residente && proceso) {
      await exportarNotasResidente(residente, proceso);
    }
  };

  const isDisabled =
    isExporting ||
    !proceso ||
    (variant === "proceso" && residentes.length === 0);

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isDisabled}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isExporting ? (
          <div>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            Exportando...
          </div>
        ) : (
          <div>
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {variant === "proceso"
              ? "Exportar a Excel"
              : "Exportar Evaluaciones"}
          </div>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md shadow-lg z-10 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
