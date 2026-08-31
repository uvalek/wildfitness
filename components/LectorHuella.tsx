"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint, PlugZap, XCircle } from "lucide-react";
import type { Socio } from "@/lib/types";
import { calcularEstatus, cn } from "@/lib/utils";

/**
 * Panel de acceso por huella digital.
 *
 * PENDIENTE DE CONECTAR. El navegador no puede leer un lector USB (p. ej.
 * ZKTeco ZK9500) por sí solo: hace falta un programa puente instalado en la
 * computadora de recepción que use el SDK de ZKTeco, identifique la huella y
 * avise cuál socio entró.
 *
 * Cuando ese puente exista, solo hay que sustituir los botones de simulación
 * por su evento real y llamar a `onIdentificado(socio)`. El resto del flujo
 * de check-in ya funciona igual que con la búsqueda por nombre.
 */
type Fase = "espera" | "leyendo" | "no-reconocido";

export function LectorHuella({
  socios,
  onIdentificado,
  onLecturaFallida,
}: {
  socios: Socio[];
  onIdentificado: (socio: Socio) => void;
  /** Limpia el resultado anterior para que no quede una bienvenida vieja. */
  onLecturaFallida?: () => void;
}) {
  const [fase, setFase] = useState<Fase>("espera");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Evita dejar un temporizador vivo si se cambia de pestaña a media lectura.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function simular(reconocido: boolean) {
    setFase("leyendo");
    timer.current = setTimeout(() => {
      if (!reconocido) {
        setFase("no-reconocido");
        onLecturaFallida?.();
        return;
      }
      // Toma un socio con membresía vigente; si no hay, cualquiera.
      const activos = socios.filter(
        (s) => calcularEstatus(s.fechaVencimiento) === "Activa"
      );
      const pool = activos.length > 0 ? activos : socios;
      const socio = pool[Math.floor(Math.random() * pool.length)];
      setFase("espera");
      if (socio) onIdentificado(socio);
    }, 1400);
  }

  const leyendo = fase === "leyendo";

  return (
    <div className="space-y-4">
      {/* Estado real del lector */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
        <PlugZap size={16} className="shrink-0 text-amber-400" />
        <p className="text-xs text-amber-200/80">
          <span className="font-semibold text-amber-300">
            Lector no conectado.
          </span>{" "}
          Requiere un lector ZKTeco y el programa puente en la computadora de
          recepción.
        </p>
      </div>

      {/* Zona de lectura */}
      <div
        className={cn(
          "grid place-items-center gap-3 rounded-xl border border-dashed py-10 text-center transition",
          leyendo
            ? "border-accent-500/50 bg-accent-500/[0.06]"
            : fase === "no-reconocido"
              ? "border-danger-500/40 bg-danger-500/[0.06]"
              : "border-ink-700"
        )}
      >
        <Fingerprint
          size={44}
          strokeWidth={1.6}
          className={cn(
            "transition",
            leyendo
              ? "animate-pulse text-accent-400"
              : fase === "no-reconocido"
                ? "text-danger-400"
                : "text-white/25"
          )}
        />
        {fase === "espera" && (
          <p className="text-sm text-white/40">
            Coloca tu dedo en el lector
          </p>
        )}
        {leyendo && (
          <p className="text-sm font-medium text-accent-400">
            Leyendo huella…
          </p>
        )}
        {fase === "no-reconocido" && (
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger-400">
              <XCircle size={15} />
              Huella no reconocida
            </p>
            <p className="mt-1 text-xs text-white/40">
              Intenta de nuevo o registra la entrada por nombre.
            </p>
          </div>
        )}
      </div>

      {/* Simulación para poder mostrar el flujo sin el aparato */}
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-800 pt-3">
        <span className="text-[11px] uppercase tracking-wide text-white/30">
          Simulación
        </span>
        <button
          onClick={() => simular(true)}
          disabled={leyendo || socios.length === 0}
          className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-400 disabled:opacity-40"
        >
          Simular lectura
        </button>
        <button
          onClick={() => simular(false)}
          disabled={leyendo}
          className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-danger-500/50 hover:bg-danger-500/10 hover:text-danger-400 disabled:opacity-40"
        >
          Simular no reconocida
        </button>
      </div>
    </div>
  );
}
