import type { EstatusMembresia } from "./types";

/** Formatea un número como pesos mexicanos: $1,234.50 */
export function formatMXN(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

/** Fecha corta legible: "15 jul 2026" */
export function formatFecha(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Hora legible: "08:42" */
export function formatHora(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Normaliza una fecha a medianoche local para comparar solo días. */
function aMedianoche(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Días restantes hasta la fecha de vencimiento (negativo si ya pasó). */
export function diasParaVencer(fechaVencimiento: string, hoy: Date = new Date()): number {
  const venc = aMedianoche(new Date(fechaVencimiento));
  const ref = aMedianoche(hoy);
  const ms = venc.getTime() - ref.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Calcula el estatus de la membresía en vivo según la fecha de vencimiento.
 * "Por vencer" = vence en 5 días o menos. "Vencida" = ya pasó.
 */
export function calcularEstatus(
  fechaVencimiento: string,
  hoy: Date = new Date()
): EstatusMembresia {
  const dias = diasParaVencer(fechaVencimiento, hoy);
  if (dias < 0) return "Vencida";
  if (dias <= 5) return "Por vencer";
  return "Activa";
}

/** Une clases condicionales sin dependencias externas. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
