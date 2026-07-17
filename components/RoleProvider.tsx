"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getMiRol } from "@/lib/data";
import { puedeAcceder, RUTA_INICIAL, type Rol } from "@/lib/roles";
import { Logo } from "./Logo";

type Ctx = { rol: Rol | null; email: string | null };
const RoleContext = createContext<Ctx>({ rol: null, email: null });

export function useRol() {
  return useContext(RoleContext);
}

/**
 * Carga el rol del usuario y protege las rutas: si el rol no tiene acceso a
 * la ruta actual, lo manda a su vista inicial. Debe ir dentro de AuthGuard
 * (ya hay sesión garantizada).
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [rol, setRol] = useState<Rol | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const r = await getMiRol();
      if (!activo) return;
      setEmail(data.user?.email ?? null);
      setRol(r);
      setListo(true);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Protección de rutas por rol.
  useEffect(() => {
    if (!listo || !rol) return;
    if (!puedeAcceder(rol, pathname)) {
      router.replace(RUTA_INICIAL[rol]);
    }
  }, [listo, rol, pathname, router]);

  if (!listo) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  return (
    <RoleContext.Provider value={{ rol, email }}>
      {children}
    </RoleContext.Provider>
  );
}
