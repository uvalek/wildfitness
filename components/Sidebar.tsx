"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Bell,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useRol } from "./RoleProvider";
import { puedeAcceder, ROL_LABEL } from "@/lib/roles";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/socios", label: "Socios", icon: Users },
  { href: "/checkin", label: "Acceso / Check-in", icon: ScanLine },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
  { href: "/tienda", label: "Tienda", icon: ShoppingBag },
  { href: "/ingresos", label: "Ingresos", icon: Wallet },
  { href: "/seguridad", label: "Seguridad", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const { rol, email } = useRol();

  // Solo muestra las vistas permitidas para el rol actual.
  const navVisible = rol
    ? NAV.filter(({ href }) => puedeAcceder(rol, href))
    : [];

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navVisible.map(({ href, label, icon: Icon }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setAbierto(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                activo
                  ? "bg-gradient-to-r from-blood-600/20 to-transparent text-white"
                  : "text-white/55 hover:bg-ink-800 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-md transition",
                  activo
                    ? "bg-blood-600 text-white shadow-glow"
                    : "bg-ink-800 text-white/60 group-hover:text-white"
                )}
              >
                <Icon size={17} strokeWidth={2.2} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-800 p-3">
        {email && (
          <div className="mb-1 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] uppercase tracking-wide text-white/30">
                Sesión
              </p>
              {rol && (
                <span className="rounded bg-blood-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blood-400">
                  {ROL_LABEL[rol]}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-white/60">{email}</p>
          </div>
        )}
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-ink-800 hover:text-white"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink-800">
            <LogOut size={17} />
          </span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800 bg-ink-900/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setAbierto(true)}
          className="grid h-10 w-10 place-items-center rounded-lg bg-ink-800 text-white"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar fija (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink-800 bg-ink-900 lg:block">
        {contenido}
      </aside>

      {/* Drawer móvil */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-ink-800 bg-ink-900">
            <button
              onClick={() => setAbierto(false)}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg bg-ink-800 text-white"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            {contenido}
          </aside>
        </div>
      )}
    </>
  );
}
