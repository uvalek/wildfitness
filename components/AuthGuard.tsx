"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "./Logo";
import { MfaChallenge } from "./MfaChallenge";

type Estado = "cargando" | "ok" | "mfa";

/**
 * Protege las vistas del dashboard: exige sesión y, si la cuenta tiene 2FA
 * activo pero la sesión aún está en AAL1, muestra el reto de verificación.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");

  const revisar = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.replace("/login");
      return;
    }
    // ¿Requiere elevar a 2FA? (tiene factor verificado pero sesión en aal1)
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") {
      setEstado("mfa");
    } else {
      setEstado("ok");
    }
  }, [router]);

  useEffect(() => {
    revisar();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [revisar, router]);

  if (estado === "cargando") {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  if (estado === "mfa") {
    return <MfaChallenge onSuccess={revisar} />;
  }

  return <>{children}</>;
}
