"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getSocios,
  getCheckinsHoy,
  registrarCheckin,
  renovarMembresia,
  getPreciosMembresia,
} from "@/lib/data";
import type { Socio, Checkin, TipoMembresia } from "@/lib/types";
import {
  calcularEstatus,
  formatHora,
  formatFecha,
  formatMXN,
  calcularRenovacion,
} from "@/lib/utils";

type Estado = "ok" | "suspendida" | "renovado";
type Resultado = { socio: Socio; estado: Estado } | null;

const PRECIOS_DEFAULT: Record<TipoMembresia, number> = {
  Semanal: 120,
  Mensual: 450,
  Anual: 3800,
};

export default function CheckinPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [precios, setPrecios] =
    useState<Record<TipoMembresia, number>>(PRECIOS_DEFAULT);
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [renovando, setRenovando] = useState(false);

  useEffect(() => {
    getSocios().then(setSocios);
    getCheckinsHoy().then(setCheckins);
    getPreciosMembresia().then(setPrecios);
  }, []);

  const sugerencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return socios
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) || String(s.folio).includes(q)
      )
      .slice(0, 6);
  }, [socios, busqueda]);

  async function seleccionar(socio: Socio) {
    setBusqueda("");
    const estatus = calcularEstatus(socio.fechaVencimiento);
    // Membresía suspendida: no registra la visita todavía; se ofrece renovar.
    if (estatus === "Suspendida") {
      setResultado({ socio, estado: "suspendida" });
      return;
    }
    const chk = await registrarCheckin(socio.id);
    setCheckins((prev) => [chk, ...prev]);
    setResultado({ socio, estado: "ok" });
  }

  async function renovar() {
    if (!resultado) return;
    setRenovando(true);
    const actualizado = await renovarMembresia(resultado.socio.id);
    if (actualizado) {
      setSocios((prev) =>
        prev.map((s) => (s.id === actualizado.id ? actualizado : s))
      );
      // Registra la entrada ya con la membresía vigente.
      const chk = await registrarCheckin(actualizado.id);
      setCheckins((prev) => [chk, ...prev]);
      setResultado({ socio: actualizado, estado: "renovado" });
    }
    setRenovando(false);
  }

  return (
    <>
      <PageHeader
        titulo="Acceso / Check-in"
        descripcion="Registra la entrada de los socios"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel de registro */}
        <div className="space-y-4">
          <Card>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
              Buscar socio
            </label>
            <div className="relative">
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Nombre o ID del socio…"
              />
              {sugerencias.length > 0 && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-850 shadow-2xl">
                  {sugerencias.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => seleccionar(s)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-white transition hover:bg-ink-800"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="rounded-md bg-ink-800 px-2 py-0.5 font-mono text-xs font-semibold text-blood-400">
                          #{s.folio}
                        </span>
                        {s.nombre}
                      </span>
                      <StatusBadge estatus={calcularEstatus(s.fechaVencimiento)} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resultado del check-in */}
            <div className="mt-4">
              {!resultado && (
                <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-ink-700 py-10 text-center">
                  <ScanLine size={32} className="text-white/25" />
                  <p className="text-sm text-white/40">
                    Selecciona un socio para registrar su entrada
                  </p>
                </div>
              )}

              {/* Acceso permitido */}
              {(resultado?.estado === "ok" ||
                resultado?.estado === "renovado") && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-display text-lg font-bold uppercase tracking-wide text-emerald-300">
                      {resultado.estado === "renovado"
                        ? "¡Membresía renovada! 💪"
                        : `¡Bienvenido, ${resultado.socio.nombre.split(" ")[0]}! 💪`}
                    </p>
                    <p className="text-sm text-emerald-200/70">
                      Socio #{resultado.socio.folio} · Acceso registrado.
                      Membresía {resultado.socio.tipoMembresia} vigente hasta el{" "}
                      {formatFecha(resultado.socio.fechaVencimiento)}.
                    </p>
                  </div>
                </div>
              )}

              {/* Membresía suspendida: se ofrece renovar en el mostrador */}
              {resultado?.estado === "suspendida" && (
                <div className="rounded-xl border border-blood-500/40 bg-blood-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-blood-400" />
                    <div>
                      <p className="font-display text-lg font-bold uppercase tracking-wide text-blood-400">
                        Membresía suspendida
                      </p>
                      <p className="text-sm text-blood-200/70">
                        Socio #{resultado.socio.folio} · La membresía venció el{" "}
                        {formatFecha(resultado.socio.fechaVencimiento)}. Renueva
                        para reactivar el acceso.
                      </p>
                    </div>
                  </div>

                  {/* Vista previa de la renovación (cuenta desde hoy) */}
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-850/60 px-3 py-2.5">
                    <div className="text-xs text-white/60">
                      Renovar {resultado.socio.tipoMembresia} ·{" "}
                      <span className="font-semibold text-white/80">
                        {formatMXN(precios[resultado.socio.tipoMembresia])}
                      </span>
                      <br />
                      Nueva vigencia hasta{" "}
                      <span className="font-semibold text-emerald-400">
                        {formatFecha(
                          calcularRenovacion(
                            resultado.socio.tipoMembresia,
                            resultado.socio.fechaVencimiento
                          ).fechaVencimiento
                        )}
                      </span>
                    </div>
                    <button
                      onClick={renovar}
                      disabled={renovando}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                      <RefreshCw
                        size={14}
                        className={renovando ? "animate-spin" : ""}
                      />
                      {renovando ? "Renovando…" : "Renovar y dar acceso"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Log de visitas de hoy */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Visitas de hoy
              </h2>
              <p className="text-xs text-white/50">Registro en tiempo real</p>
            </div>
            <span className="rounded-full bg-blood-600/20 px-3 py-1 text-sm font-bold text-blood-400">
              {checkins.length}
            </span>
          </div>

          <div className="max-h-[440px] space-y-2 overflow-y-auto">
            {checkins.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-850/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {c.socioNombre}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-xs text-white/45">
                    <Clock size={12} />
                    {formatHora(c.fecha)} h
                  </p>
                </div>
                {c.membresiaVigente ? (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    Acceso ok
                  </span>
                ) : (
                  <span className="rounded-full bg-blood-500/15 px-2.5 py-1 text-xs font-semibold text-blood-400">
                    Suspendida
                  </span>
                )}
              </div>
            ))}
            {checkins.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">
                Aún no hay visitas registradas hoy.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
