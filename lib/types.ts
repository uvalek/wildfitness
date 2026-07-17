// Tipos centrales del dominio Wild Fitness.
// Diseñados para mapear 1:1 a tablas de Supabase más adelante.

export type TipoMembresia = "Semanal" | "Mensual" | "Anual";

export type EstatusMembresia = "Activa" | "Por vencer" | "Vencida";

export type CategoriaProducto = "Bebida" | "Snack" | "Suplemento";

export interface Socio {
  id: string; // UUID interno
  folio: number; // número de socio corto (4-5 dígitos), visible al usuario
  nombre: string;
  telefono: string;
  tipoMembresia: TipoMembresia;
  fechaInicio: string; // ISO (YYYY-MM-DD)
  fechaVencimiento: string; // ISO (YYYY-MM-DD)
  recordatorioEnviado: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number; // MXN
  stock: number;
}

export interface Venta {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string; // ISO datetime
}

export interface Checkin {
  id: string;
  socioId: string;
  socioNombre: string;
  fecha: string; // ISO datetime
  membresiaVigente: boolean;
}

export interface IngresoMensual {
  mes: string; // etiqueta corta, ej "Feb"
  membresias: number;
  tienda: number;
}

export interface KPIsDashboard {
  sociosActivos: number;
  ingresosMes: number;
  membresiasPorVencer: number;
  ventasTiendaHoy: number;
}

export interface ResumenIngresos {
  totalMes: number;
  totalMembresias: number;
  totalTienda: number;
  desglosePorMembresia: { tipo: TipoMembresia; monto: number; cantidad: number }[];
  serie: IngresoMensual[];
}
