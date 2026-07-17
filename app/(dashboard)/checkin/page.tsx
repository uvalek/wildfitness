"use client";

import { useEffect, useMemo, useState } from "react";
import { ScanLine, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { getSocios, getCheckinsHoy, registrarCheckin } from "@/lib/data";
import type { Socio, Checkin } from "@/lib/types";
import { calcularEstatus, formatHora, formatFecha } from "@/lib/utils";

type Resultado = {
  socio: Socio;
  vigente: boolean;
} | null;

export default function CheckinPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);

  useEffect(() => {
    getSocios().then(setSocios);
    getCheckinsHoy().then(setCheckins);
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
    const vigente = estatus !== "Vencida";
    const chk = await registrarCheckin(socio.id);
    setCheckins((prev) => [chk, ...prev]);
    setResultado({ socio, vigente });
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

              {resultado?.vigente && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-display text-lg font-bold uppercase tracking-wide text-emerald-300">
                      ¡Bienvenido, {resultado.socio.nombre.split(" ")[0]}! 💪
                    </p>
                    <p className="text-sm text-emerald-200/70">
                      Socio #{resultado.socio.folio} · Acceso registrado.
                      Membresía {resultado.socio.tipoMembresia} vigente hasta el{" "}
                      {formatFecha(resultado.socio.fechaVencimiento)}.
                    </p>
                  </div>
                </div>
              )}

              {resultado && !resultado.vigente && (
                <div className="flex items-start gap-3 rounded-xl border border-blood-500/40 bg-blood-500/10 p-4">
                  <AlertTriangle className="mt-0.5 shrink-0 text-blood-400" />
                  <div>
                    <p className="font-display text-lg font-bold uppercase tracking-wide text-blood-400">
                      Membresía vencida
                    </p>
                    <p className="text-sm text-blood-200/70">
                      La membresía de {resultado.socio.nombre} venció el{" "}
                      {formatFecha(resultado.socio.fechaVencimiento)}. Invítalo a
                      renovar antes de ingresar.
                    </p>
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
                    Vencida
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
