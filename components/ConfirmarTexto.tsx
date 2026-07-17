"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

/**
 * Modal de confirmación por texto ("type-to-confirm"): el usuario debe escribir
 * exactamente `palabra` para habilitar la acción. Usado como seguridad para
 * agregar stock y eliminar productos. `children` permite campos extra arriba
 * del cuadro de confirmación (p. ej. la cantidad a agregar).
 */
export function ConfirmarTexto({
  abierto,
  onClose,
  titulo,
  descripcion,
  palabra,
  etiquetaBoton,
  peligro = false,
  procesando = false,
  bloquear = false,
  onConfirm,
  children,
}: {
  abierto: boolean;
  onClose: () => void;
  titulo: string;
  descripcion?: React.ReactNode;
  palabra: string;
  etiquetaBoton: string;
  peligro?: boolean;
  procesando?: boolean;
  bloquear?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  const [texto, setTexto] = useState("");
  useEffect(() => {
    if (!abierto) setTexto("");
  }, [abierto]);

  const coincide = texto.trim() === palabra.trim();

  return (
    <Modal abierto={abierto} onClose={onClose} titulo={titulo}>
      <div className="space-y-4">
        {descripcion && (
          <div className="text-sm text-white/60">{descripcion}</div>
        )}

        {children}

        <div>
          <p className="mb-1.5 text-sm text-white/60">
            Para confirmar, escribe{" "}
            <span className="select-none font-semibold text-white">
              {palabra}
            </span>
          </p>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            autoFocus
            placeholder={palabra}
            className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none focus:border-blood-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-ink-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!coincide || bloquear || procesando}
            className={cn(
              "rounded-lg px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
              peligro
                ? "bg-gradient-to-r from-blood-500 to-blood-700"
                : "bg-gradient-to-r from-emerald-600 to-emerald-700"
            )}
          >
            {procesando ? "Procesando…" : etiquetaBoton}
          </button>
        </div>
      </div>
    </Modal>
  );
}
