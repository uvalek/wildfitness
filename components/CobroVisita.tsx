"use client";

import { Banknote, AlertCircle } from "lucide-react";
import { Modal } from "@/components/Modal";
import type { Socio } from "@/lib/types";
import { formatMXN } from "@/lib/utils";

/**
 * Recordatorio de cobro para un pase de visita. Aparece ANTES de registrar la
 * entrada: el visitante paga cada vez que viene, así que el recepcionista
 * tiene que confirmar que recibió el dinero.
 */
export function CobroVisita({
  socio,
  precio,
  yaPagoHoy,
  procesando,
  onConfirmar,
  onClose,
}: {
  socio: Socio | null;
  precio: number;
  /** Reingreso el mismo día: ya cubrió el pase, no hay que cobrar otra vez. */
  yaPagoHoy: boolean;
  procesando: boolean;
  onConfirmar: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      abierto={socio !== null}
      onClose={procesando ? () => {} : onClose}
      titulo="Cobro de visita"
    >
      {socio && (
        <div className="space-y-4">
          {yaPagoHoy ? (
            <div className="flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-sky-400" />
              <p className="text-sm text-sky-200/80">
                <span className="font-semibold text-sky-300">
                  Ya pagó su visita hoy.
                </span>{" "}
                Es un reingreso: dale acceso sin volver a cobrar.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200/80">
                Cobra la visita{" "}
                <span className="font-semibold text-amber-300">antes</span> de
                dar el acceso. Solo confirma si ya recibiste el pago.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-ink-700 bg-ink-850/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Visitante
            </p>
            <p className="mt-0.5 font-display text-lg font-bold text-white">
              {socio.nombre}
            </p>
            <p className="text-xs text-white/45">
              Socio #{socio.folio} · {socio.telefono}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-3">
              <span className="inline-flex items-center gap-2 text-sm text-white/60">
                <Banknote
                  size={16}
                  className={yaPagoHoy ? "text-white/30" : "text-accent-400"}
                />
                {yaPagoHoy ? "Ya cubierto hoy" : "Total a cobrar"}
              </span>
              <span
                className={
                  yaPagoHoy
                    ? "font-display text-2xl font-bold text-white/30 line-through"
                    : "font-display text-2xl font-bold text-accent-400"
                }
              >
                {formatMXN(precio)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-ink-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirmar}
              disabled={procesando}
              className="rounded-lg bg-gradient-to-r from-accent-600 to-accent-800 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {procesando
                ? "Registrando…"
                : yaPagoHoy
                  ? "Dar acceso"
                  : "Pago recibido · Dar acceso"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
