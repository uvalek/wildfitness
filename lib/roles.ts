// Roles del panel y qué vistas puede ver cada uno.
//   owner        → dueño: acceso total.
//   recepcionista → mostrador: check-in y punto de venta (sin gestión de
//                   inventario, ingresos, socios ni dashboard financiero).

export type Rol = "owner" | "recepcionista";

/** Rutas permitidas por rol. */
export const RUTAS_POR_ROL: Record<Rol, string[]> = {
  owner: [
    "/dashboard",
    "/socios",
    "/checkin",
    "/recordatorios",
    "/tienda",
    "/ingresos",
    "/seguridad",
  ],
  recepcionista: ["/checkin", "/tienda"],
};

/** Vista inicial a la que entra cada rol tras iniciar sesión. */
export const RUTA_INICIAL: Record<Rol, string> = {
  owner: "/dashboard",
  recepcionista: "/checkin",
};

/** Etiqueta legible del rol. */
export const ROL_LABEL: Record<Rol, string> = {
  owner: "Dueño",
  recepcionista: "Recepción",
};

export function puedeAcceder(rol: Rol, ruta: string): boolean {
  return RUTAS_POR_ROL[rol].some(
    (r) => ruta === r || ruta.startsWith(r + "/")
  );
}

/** Permisos de acción (además del gateo de rutas y del RLS en la BD). */
export function puedeGestionarInventario(rol: Rol | null): boolean {
  return rol === "owner";
}
