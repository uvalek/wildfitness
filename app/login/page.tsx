"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";
import { getMiRol } from "@/lib/data";
import { RUTA_INICIAL } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("alekhammer13@gmail.com");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión activa, entra directo a la vista de su rol.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const rol = await getMiRol();
        router.replace(RUTA_INICIAL[rol]);
      }
    });
  }, [router]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: usuario.trim(),
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      setCargando(false);
      return;
    }
    // Redirige según el rol (dueño → dashboard, recepción → check-in).
    const rol = await getMiRol();
    router.push(RUTA_INICIAL[rol]);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-4">
      {/* Fondo energético */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-blood-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blood-700/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="rounded-2xl border border-ink-700/60 bg-ink-900/80 p-8 shadow-2xl backdrop-blur">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Ingresa al panel de administración
          </p>

          <form onSubmit={entrar} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Correo
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 focus-within:border-blood-500">
                <User size={18} className="text-white/40" />
                <input
                  type="email"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Contraseña
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 focus-within:border-blood-500">
                <Lock size={18} className="text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-blood-500/40 bg-blood-500/10 px-3 py-2.5 text-sm text-blood-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blood-500 to-blood-700 py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-glow transition hover:brightness-110 disabled:opacity-70"
            >
              {cargando ? "Entrando…" : "Entrar"}
              {!cargando && (
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Wild Fitness · Panel de gestión
        </p>
      </div>
    </main>
  );
}
