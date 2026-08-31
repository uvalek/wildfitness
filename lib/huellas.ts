/**
 * Huellas registradas — SIMULACIÓN.
 *
 * Guarda en el navegador (localStorage) qué dedos "tiene registrados" cada
 * socio, solo para poder demostrar el flujo sin el lector ni cambios en la
 * base de datos. NO es almacenamiento real de datos biométricos: aquí no hay
 * ninguna plantilla de huella, únicamente qué dedo se marcó.
 *
 * Cuando exista el lector y el programa puente, esto se sustituye por una
 * tabla en Supabase con las plantillas cifradas.
 */
export type ManoId = "izq" | "der";
export type DedoId = "pulgar" | "indice" | "medio" | "anular" | "menique";
export type HuellaId = `${ManoId}-${DedoId}`;

const CLAVE = "olimpo-huellas-demo";

type Registro = Record<string, HuellaId[]>;

/** localStorage puede fallar (modo privado, cookies bloqueadas). */
function leerTodo(): Registro {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Registro) : {};
  } catch {
    return {};
  }
}

function escribirTodo(reg: Registro) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(reg));
  } catch {
    // Sin persistencia: la sesión sigue funcionando en memoria.
  }
}

export function leerHuellas(socioId: string): HuellaId[] {
  return leerTodo()[socioId] ?? [];
}

/** Registra o actualiza un dedo. Devuelve la lista ya actualizada. */
export function guardarHuella(socioId: string, dedo: HuellaId): HuellaId[] {
  const reg = leerTodo();
  const actuales = reg[socioId] ?? [];
  const siguientes = actuales.includes(dedo) ? actuales : [...actuales, dedo];
  reg[socioId] = siguientes;
  escribirTodo(reg);
  return siguientes;
}

export function borrarHuella(socioId: string, dedo: HuellaId): HuellaId[] {
  const reg = leerTodo();
  const siguientes = (reg[socioId] ?? []).filter((d) => d !== dedo);
  reg[socioId] = siguientes;
  escribirTodo(reg);
  return siguientes;
}

export const DEDOS: { id: DedoId; label: string }[] = [
  { id: "pulgar", label: "Pulgar" },
  { id: "indice", label: "Índice" },
  { id: "medio", label: "Medio" },
  { id: "anular", label: "Anular" },
  { id: "menique", label: "Meñique" },
];

export const MANOS: { id: ManoId; label: string }[] = [
  { id: "izq", label: "Mano izquierda" },
  { id: "der", label: "Mano derecha" },
];

export function etiquetaHuella(id: HuellaId): string {
  const [mano, dedo] = id.split("-") as [ManoId, DedoId];
  const d = DEDOS.find((x) => x.id === dedo)?.label ?? dedo;
  return `${d} ${mano === "izq" ? "izquierdo" : "derecho"}`;
}
