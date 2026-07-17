"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, AlertTriangle, Plus, Minus, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import {
  getProductos,
  getVentasHoy,
  registrarVenta,
} from "@/lib/data";
import type { Producto, Venta, CategoriaProducto } from "@/lib/types";
import { formatMXN, formatHora, cn } from "@/lib/utils";

const CAT_ESTILO: Record<CategoriaProducto, string> = {
  Bebida: "bg-sky-500/15 text-sky-400",
  Snack: "bg-amber-500/15 text-amber-400",
  Suplemento: "bg-violet-500/15 text-violet-400",
};

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    getProductos().then((p) => {
      setProductos(p);
      if (p.length) setProductoId(p[0].id);
    });
    getVentasHoy().then(setVentas);
  }, []);

  const seleccionado = useMemo(
    () => productos.find((p) => p.id === productoId) ?? null,
    [productos, productoId]
  );

  const totalHoy = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalVenta = seleccionado ? seleccionado.precio * cantidad : 0;

  async function vender(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!seleccionado) return;
    if (cantidad > seleccionado.stock) {
      setError("No hay suficiente stock para esa cantidad.");
      return;
    }
    setProcesando(true);
    try {
      const venta = await registrarVenta(seleccionado.id, cantidad);
      setVentas((prev) => [venta, ...prev]);
      // refrescar stock desde la capa de datos
      setProductos(await getProductos());
      setCantidad(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar venta");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Tienda" descripcion="Inventario y punto de venta" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Inventario */}
        <Card className="xl:col-span-2 p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Inventario
            </h2>
            <span className="text-xs text-white/40">
              {productos.length} productos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-xs uppercase tracking-wide text-white/45">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/70">
                {productos.map((p) => {
                  const bajo = p.stock <= 5;
                  return (
                    <tr key={p.id} className="transition hover:bg-ink-850/50">
                      <td className="px-5 py-3.5 font-medium text-white">
                        {p.nombre}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium",
                            CAT_ESTILO[p.categoria]
                          )}
                        >
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/70">
                        {formatMXN(p.precio)}
                      </td>
                      <td className="px-5 py-3.5">
                        {bajo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-blood-500/15 px-2 py-1 text-xs font-semibold text-blood-400">
                            <AlertTriangle size={13} />
                            {p.stock} · bajo
                          </span>
                        ) : (
                          <span className="text-white/70">{p.stock}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Punto de venta */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-white">
            <ShoppingCart size={18} className="text-blood-500" />
            Punto de venta
          </h2>

          <form onSubmit={vender} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Producto
              </span>
              <select
                value={productoId}
                onChange={(e) => {
                  setProductoId(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.nombre} — {formatMXN(p.precio)}
                    {p.stock === 0 ? " (agotado)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Cantidad
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-850 text-white transition hover:bg-ink-800"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-center text-sm text-white outline-none focus:border-blood-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setCantidad((c) => c + 1)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-850 text-white transition hover:bg-ink-800"
                >
                  <Plus size={16} />
                </button>
              </div>
              {seleccionado && (
                <p className="mt-1.5 text-xs text-white/40">
                  Stock disponible: {seleccionado.stock}
                </p>
              )}
            </label>

            <div className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-850/60 px-3 py-3">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-display text-xl font-bold text-white">
                {formatMXN(totalVenta)}
              </span>
            </div>

            {error && (
              <p className="rounded-lg bg-blood-500/10 px-3 py-2 text-xs text-blood-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={procesando || !seleccionado || seleccionado.stock === 0}
              className="w-full rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {procesando ? "Registrando…" : "Registrar venta"}
            </button>
          </form>
        </Card>
      </div>

      {/* Historial de ventas de hoy */}
      <Card className="mt-6 p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-white">
            <Package size={18} className="text-white/50" />
            Ventas de hoy
          </h2>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Total del día
            </p>
            <p className="font-display text-lg font-bold text-blood-400">
              {formatMXN(totalHoy)}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-xs uppercase tracking-wide text-white/45">
                <th className="px-5 py-3 font-medium">Hora</th>
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Cant.</th>
                <th className="px-5 py-3 font-medium">P. unitario</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/70">
              {ventas.map((v) => (
                <tr key={v.id} className="transition hover:bg-ink-850/50">
                  <td className="px-5 py-3 text-white/55">
                    {formatHora(v.fecha)} h
                  </td>
                  <td className="px-5 py-3 font-medium text-white">
                    {v.productoNombre}
                  </td>
                  <td className="px-5 py-3 text-white/70">{v.cantidad}</td>
                  <td className="px-5 py-3 text-white/70">
                    {formatMXN(v.precioUnitario)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-white">
                    {formatMXN(v.total)}
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-white/30"
                  >
                    No hay ventas registradas hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
