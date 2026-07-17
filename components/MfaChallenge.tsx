"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "./Logo";

/**
 * Pantalla de verificación en dos pasos: pide el código de 6 dígitos de la
 * app de autenticación (Authy) y eleva la sesión a AAL2.
 */
export function MfaChallenge({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { data: factores, error: le } =
        await supabase.auth.mfa.listFactors();
      if (le) throw le;
      const totp =
        (factores?.all ?? []).find(
          (f) => f.factor_type === "totp" && f.status === "verified"
        ) ?? factores?.totp?.[0];
      if (!totp) throw new Error("No hay 2FA configurado en esta cuenta.");

      const { data: ch, error: ce } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (ce) throw ce;

      const { error: ve } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (ve) throw ve;

      onSuccess();
    } catch (err) {
      const msg = (err as Error).message ?? "Error al verificar";
      setError(
        /invalid.*code|totp/i.test(msg)
          ? "Código incorrecto. Revisa tu app e inténtalo de nuevo."
          : msg
      );
      setCargando(false);
    }
  }

  async function salir() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-blood-600/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="rounded-2xl border border-ink-700/60 bg-ink-900/80 p-8 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blood-600/20 text-blood-400">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                Verificación en dos pasos
              </h1>
              <p className="text-xs text-white/50">Cuenta de dueño protegida</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-white/60">
            Ingresa el código de 6 dígitos de tu app de autenticación (Authy).
          </p>

          <form onSubmit={verificar} className="space-y-4">
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoFocus
              placeholder="000000"
              className="w-full rounded-lg border border-ink-700 bg-ink-850 py-3 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none focus:border-blood-500"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-blood-500/40 bg-blood-500/10 px-3 py-2.5 text-sm text-blood-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando || code.length !== 6}
              className="w-full rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {cargando ? "Verificando…" : "Verificar"}
            </button>
          </form>

          <button
            onClick={salir}
            className="mt-4 w-full text-center text-xs text-white/40 transition hover:text-white/70"
          >
            Cancelar y cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
