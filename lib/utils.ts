import type { EstatusMembresia, TipoMembresia } from "./types";

/** Duración en días de cada tipo de membresía (para calcular vencimientos). */
export const DURACION_MEMBRESIA_DIAS: Record<TipoMembresia, number> = {
  Semanal: 7,
  Quincenal: 15,
  Mensual: 30,
  Anual: 365,
};

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
 * "Por vencer" = vence en 5 días o menos. "Suspendida" = ya pasó (sin acceso).
 */
export function calcularEstatus(
  fechaVencimiento: string,
  hoy: Date = new Date()
): EstatusMembresia {
  const dias = diasParaVencer(fechaVencimiento, hoy);
  if (dias < 0) return "Suspendida";
  if (dias <= 5) return "Por vencer";
  return "Activa";
}

/** Parsea "YYYY-MM-DD" a fecha local a medianoche (sin desfase de zona horaria). */
export function parseFechaLocal(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formatea una fecha a "YYYY-MM-DD" en hora local. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Suma días a una fecha "YYYY-MM-DD" y devuelve otra "YYYY-MM-DD". */
export function sumarDias(iso: string, dias: number): string {
  const d = parseFechaLocal(iso);
  d.setDate(d.getDate() + dias);
  return toISODate(d);
}

/**
 * Calcula la nueva fecha de vencimiento al renovar.
 * Regla: cuenta desde HOY si ya está vencida/suspendida (no arrastra días
 * muertos), o desde el vencimiento actual si aún está vigente (no pierde los
 * días que ya pagó). base = max(hoy, vencimiento) + duración.
 */
export function calcularRenovacion(
  tipo: TipoMembresia,
  fechaVencimientoActual: string,
  hoy: Date = new Date()
): { fechaInicio: string; fechaVencimiento: string } {
  const hoyMid = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const venc = parseFechaLocal(fechaVencimientoActual);
  const base = venc.getTime() > hoyMid.getTime() ? venc : hoyMid;
  return {
    fechaInicio: toISODate(hoyMid),
    fechaVencimiento: sumarDias(toISODate(base), DURACION_MEMBRESIA_DIAS[tipo]),
  };
}

/** Une clases condicionales sin dependencias externas. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
