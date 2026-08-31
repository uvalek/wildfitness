// Tipos centrales del dominio Olimpo Gym.
// Diseñados para mapear 1:1 a tablas de Supabase más adelante.

// "Visita" es un pase de un día: no es una membresía recurrente. El socio
// queda guardado (se le reconoce por teléfono si vuelve) y paga cada vez.
export type TipoMembresia =
  | "Visita"
  | "Semanal"
  | "Quincenal"
  | "Mensual"
  | "Anual";

// La membresía nunca se "cancela": al vencer pasa a "Suspendida" (sin acceso)
// hasta que el socio renueve.
// "Visita" no es un estado que se venza: marca que ese registro es un
// visitante, no un socio con membresía vigente.
export type EstatusMembresia =
  | "Activa"
  | "Por vencer"
  | "Suspendida"
  | "Visita";

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
