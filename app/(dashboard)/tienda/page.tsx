"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  AlertTriangle,
  Plus,
  Minus,
  Package,
  PackagePlus,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { ConfirmarTexto } from "@/components/ConfirmarTexto";
import { useRol } from "@/components/RoleProvider";
import { puedeGestionarInventario } from "@/lib/roles";
import {
  getProductos,
  getVentasHoy,
  registrarVenta,
  addProducto,
  updateProducto,
  agregarStock,
  deleteProducto,
} from "@/lib/data";
import type { Producto, Venta, CategoriaProducto } from "@/lib/types";
import { formatMXN, formatHora, cn } from "@/lib/utils";

const CAT_ESTILO: Record<CategoriaProducto, string> = {
  Bebida: "bg-sky-500/15 text-sky-400",
  Snack: "bg-amber-500/15 text-amber-400",
  Suplemento: "bg-violet-500/15 text-violet-400",
};

const CATEGORIAS: CategoriaProducto[] = ["Bebida", "Snack", "Suplemento"];

export default function TiendaPage() {
  const { rol } = useRol();
  const gestionar = puedeGestionarInventario(rol); // solo el dueño
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Alta / edición de producto (mismo formulario)
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [nNombre, setNNombre] = useState("");
  const [nCategoria, setNCategoria] = useState<CategoriaProducto>("Bebida");
  const [nPrecio, setNPrecio] = useState("");
  const [nStock, setNStock] = useState("");
  const [guardandoProd, setGuardandoProd] = useState(false);

  // Agregar stock / eliminar (con confirmación por texto)
  const [addStock, setAddStock] = useState<Producto | null>(null);
  const [addCantidad, setAddCantidad] = useState("");
  const [eliminando, setEliminando] = useState<Producto | null>(null);
  const [accionProc, setAccionProc] = useState(false);

  useEffect(() => {
    getProductos().then((p) => {
      setProductos(p);
      if (p.length) setProductoId(p[0].id);
    });
    getVentasHoy().then(setVentas);
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setNNombre("");
    setNCategoria("Bebida");
    setNPrecio("");
    setNStock("");
    setModal(true);
  }

  function abrirEditar(p: Producto) {
    setEditando(p);
    setNNombre(p.nombre);
    setNCategoria(p.categoria);
    setNPrecio(String(p.precio));
    setNStock(String(p.stock));
    setModal(true);
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!nNombre.trim()) return;
    setGuardandoProd(true);
    const datos = {
      nombre: nNombre.trim(),
      categoria: nCategoria,
      precio: Number(nPrecio) || 0,
      stock: Number(nStock) || 0,
    };
    if (editando) {
      const act = await updateProducto(editando.id, datos);
      setProductos((prev) => prev.map((x) => (x.id === act.id ? act : x)));
    } else {
      const nuevo = await addProducto(datos);
      setProductos((prev) => [...prev, nuevo]);
    }
    setGuardandoProd(false);
    setModal(false);
    setEditando(null);
  }

  async function confirmarAddStock() {
    if (!addStock) return;
    const n = Number(addCantidad);
    if (!Number.isFinite(n) || n <= 0) return;
    setAccionProc(true);
    const act = await agregarStock(addStock.id, n);
    setProductos((prev) => prev.map((x) => (x.id === act.id ? act : x)));
    setAccionProc(false);
    setAddStock(null);
    setAddCantidad("");
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    setAccionProc(true);
    await deleteProducto(eliminando.id);
    setProductos((prev) => {
      const rest = prev.filter((x) => x.id !== eliminando.id);
      if (productoId === eliminando.id) setProductoId(rest[0]?.id ?? "");
      return rest;
    });
    setAccionProc(false);
    setEliminando(null);
  }

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
      <PageHeader
        titulo="Tienda"
        descripcion="Inventario y punto de venta"
        accion={
          gestionar ? (
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110"
            >
              <PackagePlus size={18} />
              Nuevo producto
            </button>
          ) : undefined
        }
      />

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
                  {gestionar && (
                    <th className="px-5 py-3 font-medium text-right">Acción</th>
                  )}
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
                      {gestionar && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => abrirEditar(p)}
                              title="Editar producto"
                              className="inline-flex items-center justify-center rounded-lg border border-ink-700 p-2 text-white/50 transition hover:border-white/30 hover:bg-ink-800 hover:text-white"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setAddStock(p);
                                setAddCantidad("");
                              }}
                              title="Agregar stock"
                              className="inline-flex items-center justify-center rounded-lg border border-ink-700 p-2 text-white/50 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                            >
                              <PlusCircle size={15} />
                            </button>
                            <button
                              onClick={() => setEliminando(p)}
                              title="Eliminar producto"
                              className="inline-flex items-center justify-center rounded-lg border border-ink-700 p-2 text-white/50 transition hover:border-blood-500/50 hover:bg-blood-500/10 hover:text-blood-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {productos.length === 0 && (
                  <tr>
                    <td
                      colSpan={gestionar ? 5 : 4}
                      className="px-5 py-10 text-center text-sm text-white/30"
                    >
                      Sin productos. Agrega uno con “Nuevo producto”.
                    </td>
                  </tr>
                )}
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

      {/* Modal nuevo / editar producto */}
      <Modal
        abierto={modal}
        onClose={() => setModal(false)}
        titulo={editando ? "Editar producto" : "Nuevo producto"}
      >
        <form onSubmit={guardarProducto} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
              Nombre del producto
            </span>
            <input
              value={nNombre}
              onChange={(e) => setNNombre(e.target.value)}
              required
              autoFocus
              placeholder="Ej. Proteína Whey 2lb"
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
              Categoría
            </span>
            <select
              value={nCategoria}
              onChange={(e) =>
                setNCategoria(e.target.value as CategoriaProducto)
              }
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Precio (MXN)
              </span>
              <input
                type="number"
                min={0}
                step="1"
                value={nPrecio}
                onChange={(e) => setNPrecio(e.target.value)}
                required
                placeholder="0"
                className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Stock inicial
              </span>
              <input
                type="number"
                min={0}
                step="1"
                value={nStock}
                onChange={(e) => setNStock(e.target.value)}
                required
                placeholder="0"
                className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-ink-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoProd}
              className="rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {guardandoProd
                ? "Guardando…"
                : editando
                  ? "Guardar cambios"
                  : "Agregar producto"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Agregar stock (confirmación por texto) */}
      <ConfirmarTexto
        abierto={addStock !== null}
        onClose={() => setAddStock(null)}
        titulo="Agregar stock"
        palabra={addStock?.nombre ?? ""}
        etiquetaBoton="Agregar stock"
        procesando={accionProc}
        bloquear={!(Number(addCantidad) > 0)}
        onConfirm={confirmarAddStock}
        descripcion={
          addStock ? (
            <p>
              Agregar unidades a{" "}
              <span className="font-semibold text-white">
                {addStock.nombre}
              </span>{" "}
              (stock actual: {addStock.stock}).
            </p>
          ) : undefined
        }
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
            Unidades a agregar
          </span>
          <input
            type="number"
            min={1}
            step="1"
            value={addCantidad}
            onChange={(e) => setAddCantidad(e.target.value)}
            autoFocus
            placeholder="0"
            className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          {addStock && Number(addCantidad) > 0 && (
            <p className="mt-1.5 text-xs text-emerald-400">
              Nuevo stock: {addStock.stock + Number(addCantidad)}
            </p>
          )}
        </label>
      </ConfirmarTexto>

      {/* Eliminar producto (confirmación por texto) */}
      <ConfirmarTexto
        abierto={eliminando !== null}
        onClose={() => setEliminando(null)}
        titulo="Eliminar producto"
        palabra={eliminando?.nombre ?? ""}
        etiquetaBoton="Eliminar definitivamente"
        peligro
        procesando={accionProc}
        onConfirm={confirmarEliminar}
        descripcion={
          eliminando ? (
            <p>
              Vas a eliminar{" "}
              <span className="font-semibold text-white">
                {eliminando.nombre}
              </span>{" "}
              del inventario de forma permanente. El historial de ventas se
              conserva.
            </p>
          ) : undefined
        }
      />
    </>
  );
}
