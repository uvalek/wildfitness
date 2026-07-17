"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Check,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { supabase } from "@/lib/supabaseClient";

type Estado = "cargando" | "activo" | "inactivo" | "enrolando";

export default function SeguridadPage() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const refrescar = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verificado = (data?.all ?? []).find(
      (f) => f.factor_type === "totp" && f.status === "verified"
    );
    setEstado(verificado ? "activo" : "inactivo");
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  async function activar() {
    setError(null);
    setProcesando(true);
    try {
      // Limpia factores previos sin verificar para evitar duplicados.
      const { data: prev } = await supabase.auth.mfa.listFactors();
      for (const f of prev?.all ?? []) {
        if (f.status !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authy",
      });
      if (error) throw error;
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setCode("");
      setEstado("enrolando");
    } catch (err) {
      setError((err as Error).message ?? "No se pudo iniciar el 2FA");
    } finally {
      setProcesando(false);
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setProcesando(true);
    try {
      const { data: ch, error: ce } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (ce) throw ce;
      const { error: ve } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (ve) throw ve;
      setQr(null);
      setSecret(null);
      setFactorId(null);
      await refrescar();
    } catch (err) {
      const msg = (err as Error).message ?? "Error";
      setError(
        /invalid.*code|totp/i.test(msg)
          ? "Código incorrecto. Revisa Authy e inténtalo de nuevo."
          : msg
      );
    } finally {
      setProcesando(false);
    }
  }

  async function desactivar() {
    if (
      !window.confirm(
        "¿Desactivar la verificación en dos pasos? Quedará protegida solo con contraseña. " +
          "Nota: el 2FA es de tu cuenta de Supabase, así que esto también lo quita de otras apps que usen la misma cuenta."
      )
    )
      return;
    setProcesando(true);
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of data?.all ?? []) {
      if (f.factor_type === "totp") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
    await refrescar();
    setProcesando(false);
  }

  return (
    <>
      <PageHeader
        titulo="Seguridad"
        descripcion="Verificación en dos pasos (2FA) para la cuenta de dueño"
      />

      <div className="max-w-xl">
        <Card>
          {estado === "cargando" && (
            <p className="py-8 text-center text-sm text-white/40">Cargando…</p>
          )}

          {/* 2FA activo */}
          {estado === "activo" && (
            <div>
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-display text-lg font-bold uppercase tracking-wide text-emerald-300">
                    2FA activo
                  </p>
                  <p className="text-sm text-emerald-200/70">
                    Tu cuenta pide un código de Authy al iniciar sesión.
                  </p>
                </div>
              </div>
              <button
                onClick={desactivar}
                disabled={procesando}
                className="mt-4 rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-blood-500/50 hover:bg-blood-500/10 hover:text-blood-400 disabled:opacity-50"
              >
                Desactivar 2FA
              </button>
            </div>
          )}

          {/* 2FA inactivo → botón para activar */}
          {estado === "inactivo" && (
            <div>
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <ShieldAlert className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-display text-lg font-bold uppercase tracking-wide text-amber-300">
                    2FA desactivado
                  </p>
                  <p className="text-sm text-amber-200/70">
                    Añade una capa extra de seguridad con Authy.
                  </p>
                </div>
              </div>
              {error && <ErrorMsg>{error}</ErrorMsg>}
              <button
                onClick={activar}
                disabled={procesando}
                className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
              >
                <ShieldCheck size={18} />
                {procesando ? "Generando…" : "Activar 2FA"}
              </button>
            </div>
          )}

          {/* Enrolando: mostrar QR + código */}
          {estado === "enrolando" && (
            <div>
              <ol className="mb-4 space-y-1.5 text-sm text-white/60">
                <li className="flex gap-2">
                  <Smartphone size={16} className="mt-0.5 shrink-0 text-blood-400" />
                  1. Abre Authy y escanea este código QR.
                </li>
                <li className="pl-6">
                  2. Ingresa el código de 6 dígitos que aparece para confirmar.
                </li>
              </ol>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0 rounded-xl bg-white p-3">
                  {qr &&
                    (qr.startsWith("<svg") ? (
                      <div
                        className="h-44 w-44"
                        // QR generado por Supabase (SVG confiable)
                        dangerouslySetInnerHTML={{ __html: qr }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qr}
                        alt="Código QR 2FA"
                        className="h-44 w-44"
                      />
                    ))}
                </div>

                <div className="w-full">
                  {secret && (
                    <div className="mb-3 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">
                        ¿No puedes escanear? Ingresa esta clave:
                      </p>
                      <p className="break-all font-mono text-xs text-white/80">
                        {secret}
                      </p>
                    </div>
                  )}

                  <form onSubmit={confirmar} className="space-y-3">
                    <input
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      autoFocus
                      placeholder="000000"
                      className="w-full rounded-lg border border-ink-700 bg-ink-850 py-2.5 text-center font-mono text-xl tracking-[0.4em] text-white outline-none focus:border-blood-500"
                    />
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={procesando || code.length !== 6}
                        className="flex-1 rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
                      >
                        {procesando ? "Confirmando…" : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEstado("inactivo");
                          setQr(null);
                          setError(null);
                        }}
                        className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-ink-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-blood-500/40 bg-blood-500/10 px-3 py-2.5 text-sm text-blood-400">
      <AlertCircle size={16} className="shrink-0" />
      {children}
    </div>
  );
}
