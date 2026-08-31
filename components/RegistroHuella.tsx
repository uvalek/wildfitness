"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint, PlugZap, Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import type { Socio } from "@/lib/types";
import {
  DEDOS,
  MANOS,
  etiquetaHuella,
  leerHuellas,
  guardarHuella,
  borrarHuella,
  type DedoId,
  type HuellaId,
  type ManoId,
} from "@/lib/huellas";
import { cn } from "@/lib/utils";

/** Geometría de una mano (pulgar a la izquierda); la otra se refleja. */
const DEDO_FORMA: Record<
  DedoId,
  { x: number; y: number; w: number; h: number; rot?: string }
> = {
  pulgar: { x: 6, y: 88, w: 14, h: 44, rot: "rotate(-30 13 110)" },
  indice: { x: 24, y: 36, w: 15, h: 54 },
  medio: { x: 42, y: 26, w: 15, h: 64 },
  anular: { x: 60, y: 33, w: 15, h: 57 },
  menique: { x: 78, y: 50, w: 13, h: 40 },
};

const CAPTURAS = 3;

function Mano({
  mano,
  registradas,
  seleccion,
  onSeleccionar,
}: {
  mano: ManoId;
  registradas: HuellaId[];
  seleccion: HuellaId | null;
  onSeleccionar: (id: HuellaId) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 104 148"
        className="h-40 w-auto"
        role="group"
        aria-label={MANOS.find((m) => m.id === mano)?.label}
      >
        {/* La mano izquierda es el espejo de la derecha */}
        <g transform={mano === "izq" ? "translate(104,0) scale(-1,1)" : ""}>
          {/* Palma */}
          <rect
            x={22}
            y={82}
            width={71}
            height={56}
            rx={20}
            className="fill-ink-800 stroke-ink-700"
            strokeWidth={1.5}
          />
          {DEDOS.map(({ id }) => {
            const clave = `${mano}-${id}` as HuellaId;
            const registrada = registradas.includes(clave);
            const activa = seleccion === clave;
            const f = DEDO_FORMA[id];
            return (
              <rect
                key={id}
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={f.w / 2}
                transform={f.rot}
                strokeWidth={1.5}
                onClick={() => onSeleccionar(clave)}
                className={cn(
                  "cursor-pointer transition",
                  registrada && activa
                    ? "fill-accent-500 stroke-accent-200"
                    : registrada
                      ? "fill-accent-600 stroke-accent-400"
                      : activa
                        ? "fill-accent-800 stroke-accent-400"
                        : "fill-ink-800 stroke-ink-700 hover:fill-ink-750"
                )}
              >
                <title>
                  {etiquetaHuella(clave)}
                  {registrada ? " · registrada" : ""}
                </title>
              </rect>
            );
          })}
        </g>
      </svg>
      <span className="text-[11px] uppercase tracking-wide text-white/40">
        {mano === "izq" ? "Izquierda" : "Derecha"}
      </span>
    </div>
  );
}

export function RegistroHuella({
  socio,
  onClose,
}: {
  socio: Socio | null;
  onClose: () => void;
}) {
  const [registradas, setRegistradas] = useState<HuellaId[]>([]);
  const [seleccion, setSeleccion] = useState<HuellaId | null>(null);
  const [fase, setFase] = useState<"idle" | "capturando" | "ok">("idle");
  const [paso, setPaso] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpiarTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Carga las huellas del socio al abrir y reinicia el estado.
  useEffect(() => {
    if (!socio) return;
    setRegistradas(leerHuellas(socio.id));
    setSeleccion(null);
    setFase("idle");
    setPaso(0);
  }, [socio]);

  useEffect(() => limpiarTimer, []);

  function elegir(id: HuellaId) {
    if (fase === "capturando") return;
    limpiarTimer();
    setSeleccion(id);
    setFase("idle");
    setPaso(0);
  }

  function capturar() {
    if (!socio || !seleccion) return;
    setFase("capturando");
    // Arranca en 1: mostrar "captura 0 de 3" se leería como un error.
    setPaso(1);
    let n = 1;
    const tick = () => {
      n += 1;
      if (n <= CAPTURAS) {
        setPaso(n);
        timer.current = setTimeout(tick, 800);
      } else {
        setRegistradas(guardarHuella(socio.id, seleccion));
        setFase("ok");
      }
    };
    timer.current = setTimeout(tick, 800);
  }

  function eliminar() {
    if (!socio || !seleccion) return;
    limpiarTimer();
    setRegistradas(borrarHuella(socio.id, seleccion));
    setFase("idle");
    setPaso(0);
  }

  const yaRegistrada = seleccion ? registradas.includes(seleccion) : false;
  const capturando = fase === "capturando";

  return (
    <Modal
      abierto={socio !== null}
      onClose={onClose}
      titulo={socio ? `Huella · ${socio.nombre}` : "Huella"}
    >
      {socio && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <PlugZap size={16} className="shrink-0 text-amber-400" />
            <p className="text-xs text-amber-200/80">
              <span className="font-semibold text-amber-300">Simulación.</span>{" "}
              El lector no está conectado; no se captura ninguna huella real.
            </p>
          </div>

          <p className="text-sm text-white/50">
            Selecciona el dedo que quieres registrar o actualizar. Los dedos en
            verde ya tienen huella.
          </p>

          <div className="flex justify-center gap-6 rounded-xl border border-ink-800 bg-ink-850/40 py-4">
            {MANOS.map((m) => (
              <Mano
                key={m.id}
                mano={m.id}
                registradas={registradas}
                seleccion={seleccion}
                onSeleccionar={elegir}
              />
            ))}
          </div>

          {/* Panel del dedo seleccionado */}
          {!seleccion ? (
            <p className="rounded-lg border border-dashed border-ink-700 py-4 text-center text-sm text-white/35">
              Ningún dedo seleccionado
            </p>
          ) : (
            <div className="rounded-xl border border-ink-700 bg-ink-850/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Fingerprint
                    size={18}
                    className={cn(
                      capturando
                        ? "animate-pulse text-accent-400"
                        : yaRegistrada
                          ? "text-accent-400"
                          : "text-white/40"
                    )}
                  />
                  <span className="text-sm font-medium text-white">
                    {etiquetaHuella(seleccion)}
                  </span>
                  {yaRegistrada && !capturando && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-semibold text-accent-400">
                      <Check size={11} />
                      Registrada
                    </span>
                  )}
                </div>
                {yaRegistrada && !capturando && (
                  <button
                    onClick={eliminar}
                    title="Eliminar huella"
                    className="inline-flex items-center justify-center rounded-lg border border-ink-700 p-2 text-white/50 transition hover:border-danger-500/50 hover:bg-danger-500/10 hover:text-danger-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {capturando && (
                <div className="mt-3">
                  <p className="text-xs text-white/60">
                    Coloca el dedo en el lector · captura {paso} de {CAPTURAS}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-700 transition-all duration-500"
                      style={{ width: `${(paso / CAPTURAS) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {fase === "ok" && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-400">
                  <Check size={13} />
                  Huella guardada correctamente.
                </p>
              )}

              {!capturando && (
                <button
                  onClick={capturar}
                  className="mt-3 w-full rounded-lg bg-gradient-to-r from-accent-600 to-accent-800 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110"
                >
                  {yaRegistrada ? "Actualizar huella" : "Registrar huella"}
                </button>
              )}
            </div>
          )}

          <p className="text-center text-xs text-white/30">
            {registradas.length === 0
              ? "Sin huellas registradas"
              : `${registradas.length} ${
                  registradas.length === 1 ? "dedo registrado" : "dedos registrados"
                }`}
          </p>
        </div>
      )}
    </Modal>
  );
}
