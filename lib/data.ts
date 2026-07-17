// ============================================================================
//  CAPA DE ACCESO A DATOS — única puerta de entrada a los datos.
//
//  Ahora conectada a SUPABASE (proyecto SuperCerebro). Todas las funciones
//  son `async` y devuelven los mismos tipos de siempre, así que la interfaz
//  (firmas y tipos) no cambió y la UI sigue igual.
//
//  Tablas: wf_socios, wf_productos, wf_ventas, wf_checkins,
//          wf_precios_membresia, wf_ingresos_mensuales
// ============================================================================

import type {
  Socio,
  Producto,
  Venta,
  Checkin,
  TipoMembresia,
  KPIsDashboard,
  ResumenIngresos,
  IngresoMensual,
} from "./types";
import { supabase } from "./supabaseClient";
import { calcularEstatus, diasParaVencer, calcularRenovacion } from "./utils";
import type { Rol } from "./roles";

// -------------------------------- ROLES ------------------------------------

/** Rol del usuario en sesión. Por seguridad, ante la duda devuelve el rol
 *  con menos privilegios ("recepcionista"). */
export async function getMiRol(): Promise<Rol> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return "recepcionista";
  const { data, error } = await supabase
    .from("wf_perfiles")
    .select("rol")
    .eq("user_id", uid)
    .maybeSingle();
  if (error || !data) return "recepcionista";
  return (data as { rol: Rol }).rol;
}

// ---------------------------------------------------------------------------
//  Mapeadores fila (snake_case DB) -> objeto de dominio (camelCase)
// ---------------------------------------------------------------------------
type SocioRow = {
  id: string;
  folio: number;
  nombre: string;
  telefono: string | null;
  tipo_membresia: TipoMembresia;
  fecha_inicio: string;
  fecha_vencimiento: string;
  recordatorio_enviado: boolean;
};
type ProductoRow = {
  id: string;
  nombre: string;
  categoria: Producto["categoria"];
  precio: number;
  stock: number;
};
type VentaRow = {
  id: string;
  producto_id: string | null;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha: string;
};
type CheckinRow = {
  id: string;
  socio_id: string | null;
  socio_nombre: string;
  fecha: string;
  membresia_vigente: boolean;
};

const toSocio = (r: SocioRow): Socio => ({
  id: r.id,
  folio: r.folio,
  nombre: r.nombre,
  telefono: r.telefono ?? "—",
  tipoMembresia: r.tipo_membresia,
  fechaInicio: r.fecha_inicio,
  fechaVencimiento: r.fecha_vencimiento,
  recordatorioEnviado: r.recordatorio_enviado,
});
const toProducto = (r: ProductoRow): Producto => ({
  id: r.id,
  nombre: r.nombre,
  categoria: r.categoria,
  precio: Number(r.precio),
  stock: r.stock,
});
const toVenta = (r: VentaRow): Venta => ({
  id: r.id,
  productoId: r.producto_id ?? "",
  productoNombre: r.producto_nombre,
  cantidad: r.cantidad,
  precioUnitario: Number(r.precio_unitario),
  total: Number(r.total),
  fecha: r.fecha,
});
const toCheckin = (r: CheckinRow): Checkin => ({
  id: r.id,
  socioId: r.socio_id ?? "",
  socioNombre: r.socio_nombre,
  fecha: r.fecha,
  membresiaVigente: r.membresia_vigente,
});

// ISO del inicio del día / mes en curso (hora local del navegador).
function inicioDeHoy(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}
function inicioDeMes(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function etiquetaMes(offsetMeses: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMeses);
  return new Intl.DateTimeFormat("es-MX", { month: "short" })
    .format(d)
    .replace(".", "");
}

function fail(context: string, error: unknown): never {
  throw new Error(`[data:${context}] ${(error as Error)?.message ?? error}`);
}

// -------------------------------- SOCIOS -----------------------------------

export async function getSocios(): Promise<Socio[]> {
  const { data, error } = await supabase
    .from("wf_socios")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("getSocios", error);
  return (data as SocioRow[]).map(toSocio);
}

export async function getSocioById(id: string): Promise<Socio | null> {
  const { data, error } = await supabase
    .from("wf_socios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("getSocioById", error);
  return data ? toSocio(data as SocioRow) : null;
}

export async function addSocio(input: {
  nombre: string;
  telefono: string;
  tipoMembresia: TipoMembresia;
  fechaInicio: string;
  fechaVencimiento: string;
}): Promise<Socio> {
  const { data, error } = await supabase
    .from("wf_socios")
    .insert({
      nombre: input.nombre,
      telefono: input.telefono,
      tipo_membresia: input.tipoMembresia,
      fecha_inicio: input.fechaInicio,
      fecha_vencimiento: input.fechaVencimiento,
    })
    .select("*")
    .single();
  if (error) fail("addSocio", error);
  return toSocio(data as SocioRow);
}

export async function updateSocio(
  id: string,
  patch: Partial<{
    nombre: string;
    telefono: string;
    tipoMembresia: TipoMembresia;
    fechaInicio: string;
    fechaVencimiento: string;
    recordatorioEnviado: boolean;
  }>
): Promise<Socio | null> {
  const row: Record<string, unknown> = {};
  if (patch.nombre !== undefined) row.nombre = patch.nombre;
  if (patch.telefono !== undefined) row.telefono = patch.telefono;
  if (patch.tipoMembresia !== undefined) row.tipo_membresia = patch.tipoMembresia;
  if (patch.fechaInicio !== undefined) row.fecha_inicio = patch.fechaInicio;
  if (patch.fechaVencimiento !== undefined)
    row.fecha_vencimiento = patch.fechaVencimiento;
  if (patch.recordatorioEnviado !== undefined)
    row.recordatorio_enviado = patch.recordatorioEnviado;

  const { data, error } = await supabase
    .from("wf_socios")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) fail("updateSocio", error);
  return data ? toSocio(data as SocioRow) : null;
}

/**
 * Renueva la membresía de un socio. La nueva fecha de vencimiento se calcula
 * desde HOY si estaba suspendida (no arrastra días muertos) o desde su
 * vencimiento actual si sigue vigente (no pierde días pagados). Ver
 * `calcularRenovacion` en lib/utils.ts.
 */
export async function renovarMembresia(socioId: string): Promise<Socio | null> {
  const socio = await getSocioById(socioId);
  if (!socio) return null;
  const { fechaInicio, fechaVencimiento } = calcularRenovacion(
    socio.tipoMembresia,
    socio.fechaVencimiento
  );
  return updateSocio(socioId, {
    fechaInicio,
    fechaVencimiento,
    recordatorioEnviado: false,
  });
}

// ------------------------------ RECORDATORIOS -------------------------------

/** Socios cuya membresía vence en los próximos `dias` (y no vencidos aún). */
export async function getMembresiasPorVencer(dias = 5): Promise<Socio[]> {
  const socios = await getSocios();
  return socios
    .filter((s) => {
      const d = diasParaVencer(s.fechaVencimiento);
      return d >= 0 && d <= dias;
    })
    .sort(
      (a, b) =>
        diasParaVencer(a.fechaVencimiento) - diasParaVencer(b.fechaVencimiento)
    );
}

export async function marcarRecordatorioEnviado(
  socioId: string
): Promise<Socio | null> {
  return updateSocio(socioId, { recordatorioEnviado: true });
}

// ------------------------------- PRODUCTOS ----------------------------------

export async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("wf_productos")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) fail("getProductos", error);
  return (data as ProductoRow[]).map(toProducto);
}

export async function addProducto(input: {
  nombre: string;
  categoria: Producto["categoria"];
  precio: number;
  stock: number;
}): Promise<Producto> {
  const { data, error } = await supabase
    .from("wf_productos")
    .insert({
      nombre: input.nombre,
      categoria: input.categoria,
      precio: input.precio,
      stock: input.stock,
    })
    .select("*")
    .single();
  if (error) fail("addProducto", error);
  return toProducto(data as ProductoRow);
}

/** Elimina un producto. El histórico de ventas se conserva (ON DELETE SET NULL). */
export async function deleteProducto(id: string): Promise<void> {
  const { error } = await supabase.from("wf_productos").delete().eq("id", id);
  if (error) fail("deleteProducto", error);
}

/** Registra una venta: valida stock, lo baja y crea el registro. */
export async function registrarVenta(
  productoId: string,
  cantidad: number
): Promise<Venta> {
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a cero");

  const { data: prodData, error: prodErr } = await supabase
    .from("wf_productos")
    .select("*")
    .eq("id", productoId)
    .single();
  if (prodErr) fail("registrarVenta:producto", prodErr);
  const producto = toProducto(prodData as ProductoRow);
  if (producto.stock < cantidad) throw new Error("Stock insuficiente");

  // Baja el stock
  const { error: updErr } = await supabase
    .from("wf_productos")
    .update({ stock: producto.stock - cantidad })
    .eq("id", productoId);
  if (updErr) fail("registrarVenta:stock", updErr);

  // Crea la venta
  const { data, error } = await supabase
    .from("wf_ventas")
    .insert({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad,
      precio_unitario: producto.precio,
      total: producto.precio * cantidad,
    })
    .select("*")
    .single();
  if (error) fail("registrarVenta:insert", error);
  return toVenta(data as VentaRow);
}

export async function getVentasHoy(): Promise<Venta[]> {
  const { data, error } = await supabase
    .from("wf_ventas")
    .select("*")
    .gte("fecha", inicioDeHoy())
    .order("fecha", { ascending: false });
  if (error) fail("getVentasHoy", error);
  return (data as VentaRow[]).map(toVenta);
}

// -------------------------------- CHECK-IN ----------------------------------

export async function getCheckinsHoy(): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from("wf_checkins")
    .select("*")
    .gte("fecha", inicioDeHoy())
    .order("fecha", { ascending: false });
  if (error) fail("getCheckinsHoy", error);
  return (data as CheckinRow[]).map(toCheckin);
}

/** Visitas de los últimos `dias` días (incluye hoy), ordenadas de la más
 *  reciente a la más antigua. Para el registro agrupado por día. */
export async function getCheckinsRecientes(dias = 5): Promise<Checkin[]> {
  const d = new Date();
  const desde = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dias - 1));
  const { data, error } = await supabase
    .from("wf_checkins")
    .select("*")
    .gte("fecha", desde.toISOString())
    .order("fecha", { ascending: false });
  if (error) fail("getCheckinsRecientes", error);
  return (data as CheckinRow[]).map(toCheckin);
}

/** Registra la entrada de un socio con fecha/hora actuales. */
export async function registrarCheckin(socioId: string): Promise<Checkin> {
  const socio = await getSocioById(socioId);
  if (!socio) throw new Error("Socio no encontrado");
  const vigente = calcularEstatus(socio.fechaVencimiento) !== "Suspendida";

  const { data, error } = await supabase
    .from("wf_checkins")
    .insert({
      socio_id: socio.id,
      socio_nombre: socio.nombre,
      membresia_vigente: vigente,
    })
    .select("*")
    .single();
  if (error) fail("registrarCheckin", error);
  return toCheckin(data as CheckinRow);
}

// ------------------------------- DASHBOARD ----------------------------------

export async function getKPIsDashboard(): Promise<KPIsDashboard> {
  const [socios, ventasMes] = await Promise.all([
    getSocios(),
    getVentasDelMes(),
  ]);

  const sociosActivos = socios.filter(
    (s) => calcularEstatus(s.fechaVencimiento) === "Activa"
  ).length;
  const membresiasPorVencer = socios.filter((s) => {
    const d = diasParaVencer(s.fechaVencimiento);
    return d >= 0 && d <= 5;
  }).length;

  const ventasTiendaHoy = (await getVentasHoy()).reduce(
    (acc, v) => acc + v.total,
    0
  );
  const tiendaMes = ventasMes.reduce((acc, v) => acc + v.total, 0);
  const membresiasMes = await getMembresiasMesActual();
  const ingresosMes = membresiasMes + tiendaMes;

  return { sociosActivos, ingresosMes, membresiasPorVencer, ventasTiendaHoy };
}

// --------------------------------- INGRESOS ---------------------------------

export async function getIngresosMensuales(): Promise<IngresoMensual[]> {
  return construirSerie();
}

export async function getResumenIngresos(): Promise<ResumenIngresos> {
  const [serie, socios, precios, ventasMes, membresiasMes] = await Promise.all([
    construirSerie(),
    getSocios(),
    getPreciosMembresia(),
    getVentasDelMes(),
    getMembresiasMesActual(),
  ]);

  const activos = socios.filter(
    (s) => calcularEstatus(s.fechaVencimiento) !== "Suspendida"
  );
  const tipos: TipoMembresia[] = ["Semanal", "Quincenal", "Mensual", "Anual"];
  const desglosePorMembresia = tipos.map((tipo) => {
    const cantidad = activos.filter((s) => s.tipoMembresia === tipo).length;
    return { tipo, cantidad, monto: cantidad * (precios[tipo] ?? 0) };
  });

  const totalTienda = ventasMes.reduce((acc, v) => acc + v.total, 0);
  const totalMembresias = membresiasMes;
  const totalMes = totalMembresias + totalTienda;

  return {
    totalMes,
    totalMembresias,
    totalTienda,
    desglosePorMembresia,
    serie,
  };
}

// ------------------------------- helpers internos ---------------------------

export async function getPreciosMembresia(): Promise<
  Record<TipoMembresia, number>
> {
  const { data, error } = await supabase
    .from("wf_precios_membresia")
    .select("*");
  if (error) fail("getPreciosMembresia", error);
  const map = { Semanal: 0, Mensual: 0, Anual: 0 } as Record<
    TipoMembresia,
    number
  >;
  for (const row of data as { tipo: TipoMembresia; precio: number }[]) {
    map[row.tipo] = Number(row.precio);
  }
  return map;
}

async function getVentasDelMes(): Promise<Venta[]> {
  const { data, error } = await supabase
    .from("wf_ventas")
    .select("*")
    .gte("fecha", inicioDeMes());
  if (error) fail("getVentasDelMes", error);
  return (data as VentaRow[]).map(toVenta);
}

async function getMembresiasMesActual(): Promise<number> {
  const { data, error } = await supabase
    .from("wf_ingresos_mensuales")
    .select("membresias")
    .eq("offset_meses", 0)
    .maybeSingle();
  if (error) fail("getMembresiasMesActual", error);
  return data ? Number((data as { membresias: number }).membresias) : 0;
}

async function construirSerie(): Promise<IngresoMensual[]> {
  const [{ data, error }, ventasMes] = await Promise.all([
    supabase
      .from("wf_ingresos_mensuales")
      .select("*")
      .order("offset_meses", { ascending: true }),
    getVentasDelMes(),
  ]);
  if (error) fail("construirSerie", error);

  const ventasMesTotal = ventasMes.reduce((acc, v) => acc + v.total, 0);
  return (
    data as { offset_meses: number; membresias: number; tienda: number }[]
  ).map((row) => {
    const esMesActual = row.offset_meses === 0;
    return {
      mes: etiquetaMes(row.offset_meses),
      membresias: Number(row.membresias),
      // El mes en curso suma en vivo lo vendido en la tienda.
      tienda: esMesActual
        ? Number(row.tienda) + ventasMesTotal
        : Number(row.tienda),
    };
  });
}
