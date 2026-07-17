"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "./Logo";

/**
 * Protege las vistas del dashboard: si no hay sesión de Supabase, manda a
 * /login. También reacciona al cierre de sesión en cualquier pestaña.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      if (!data.session) {
        router.replace("/login");
      } else {
        setListo(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!listo) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
