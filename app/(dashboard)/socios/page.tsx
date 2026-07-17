"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";
import { Modal } from "@/components/Modal";
import { getSocios, addSocio, getPreciosMembresia } from "@/lib/data";
import type { Socio, TipoMembresia } from "@/lib/types";
import { formatFecha, calcularEstatus, formatMXN } from "@/lib/utils";

const TIPOS: TipoMembresia[] = ["Semanal", "Mensual", "Anual"];

// Valores por defecto mientras carga la consulta a la base de datos.
const PRECIOS_DEFAULT: Record<TipoMembresia, number> = {
  Semanal: 120,
  Mensual: 450,
  Anual: 3800,
};

// Días de duración por tipo, para autocalcular el vencimiento.
const DURACION: Record<TipoMembresia, number> = {
  Semanal: 7,
  Mensual: 30,
  Anual: 365,
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function sumarDias(iso: string, dias: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default function SociosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [precios, setPrecios] =
    useState<Record<TipoMembresia, number>>(PRECIOS_DEFAULT);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);

  // Formulario nuevo socio
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipo, setTipo] = useState<TipoMembresia>("Mensual");
  const [inicio, setInicio] = useState(hoyISO());
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getSocios().then(setSocios);
    getPreciosMembresia().then(setPrecios);
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return socios;
    return socios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) || String(s.folio).includes(q)
    );
  }, [socios, busqueda]);

  const vencimiento = sumarDias(inicio, DURACION[tipo]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    const nuevo = await addSocio({
      nombre: nombre.trim(),
      telefono: telefono.trim() || "—",
      tipoMembresia: tipo,
      fechaInicio: inicio,
      fechaVencimiento: vencimiento,
    });
    setSocios((prev) => [nuevo, ...prev]);
    setGuardando(false);
    setModal(false);
    // reset
    setNombre("");
    setTelefono("");
    setTipo("Mensual");
    setInicio(hoyISO());
  }

  return (
    <>
      <PageHeader
        titulo="Socios"
        descripcion={`${socios.length} socios registrados`}
        accion={
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110"
          >
            <UserPlus size={18} />
            Nuevo socio
          </button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre o ID…"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-xs uppercase tracking-wide text-white/45">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3 font-medium">Membresía</th>
                <th className="px-5 py-3 font-medium">Inicio</th>
                <th className="px-5 py-3 font-medium">Vencimiento</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/70">
              {filtrados.map((s) => (
                <tr key={s.id} className="transition hover:bg-ink-850/50">
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs font-semibold text-blood-400">
                      #{s.folio}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-white">
                    {s.nombre}
                  </td>
                  <td className="px-5 py-3.5 text-white/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={13} className="text-white/30" />
                      {s.telefono}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-ink-800 px-2 py-1 text-xs font-medium text-white/70">
                      {s.tipoMembresia}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/60">
                    {formatFecha(s.fechaInicio)}
                  </td>
                  <td className="px-5 py-3.5 text-white/60">
                    {formatFecha(s.fechaVencimiento)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge estatus={calcularEstatus(s.fechaVencimiento)} />
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-white/30"
                  >
                    No se encontraron socios con “{busqueda}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal nuevo socio */}
      <Modal abierto={modal} onClose={() => setModal(false)} titulo="Nuevo socio">
        <form onSubmit={guardar} className="space-y-4">
          <Campo label="Nombre completo">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
              placeholder="Ej. Juan Pérez López"
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
            />
          </Campo>

          <Campo label="Teléfono">
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="55 1234 5678"
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Tipo de membresía">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMembresia)}
                className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t} · {formatMXN(precios[t])}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Fecha de inicio">
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500 [color-scheme:dark]"
              />
            </Campo>
          </div>

          <div className="rounded-lg border border-ink-800 bg-ink-850/60 px-3 py-2.5 text-xs text-white/50">
            Vence el{" "}
            <span className="font-semibold text-white/80">
              {formatFecha(vencimiento)}
            </span>{" "}
            · Cobro: {formatMXN(precios[tipo])}
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
              disabled={guardando}
              className="rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Agregar socio"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
