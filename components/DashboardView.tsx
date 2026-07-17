"use client";

import type { LucideIcon } from "lucide-react";
import {
  Users,
  DollarSign,
  AlarmClock,
  ShoppingBag,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { IngresosChart } from "@/components/IngresosChart";
import type { KPIsDashboard, IngresoMensual, Socio } from "@/lib/types";
import { formatMXN, formatFecha, diasParaVencer, cn } from "@/lib/utils";

type Acento = "emerald" | "blood" | "amber" | "sky";

const ESTILOS: Record<
  Acento,
  { glow: string; badge: string; ring: string; marca: string }
> = {
  emerald: {
    glow: "bg-emerald-500/15",
    badge: "bg-emerald-500/15 text-emerald-400",
    ring: "ring-emerald-400/25",
    marca: "text-emerald-500/[0.05]",
  },
  blood: {
    glow: "bg-blood-600/20",
    badge: "bg-blood-500/15 text-blood-400",
    ring: "ring-blood-400/25",
    marca: "text-blood-500/[0.06]",
  },
  amber: {
    glow: "bg-amber-500/15",
    badge: "bg-amber-500/15 text-amber-400",
    ring: "ring-amber-400/25",
    marca: "text-amber-500/[0.05]",
  },
  sky: {
    glow: "bg-sky-500/15",
    badge: "bg-sky-500/15 text-sky-400",
    ring: "ring-sky-400/25",
    marca: "text-sky-500/[0.05]",
  },
};

/** KPI con el icono como protagonista, esquinas suaves y glow tenue. */
function KpiTile({
  titulo,
  valor,
  icon: Icon,
  acento,
  nota,
  delay,
}: {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  acento: Acento;
  nota?: string;
  delay: number;
}) {
  const e = ESTILOS[acento];
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up group relative overflow-hidden rounded-[1.75rem] bg-ink-900/50 p-6 ring-1 ring-white/[0.04] transition duration-300 hover:ring-white/10"
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125",
          e.glow
        )}
      />
      <Icon
        className={cn(
          "pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 transition-transform duration-500 group-hover:scale-110",
          e.marca
        )}
        strokeWidth={1.5}
      />

      <div className="relative">
        <span
          className={cn(
            "mb-6 grid h-16 w-16 place-items-center rounded-3xl ring-1 ring-inset transition-transform duration-300 group-hover:-translate-y-1",
            e.badge,
            e.ring
          )}
        >
          <Icon size={30} strokeWidth={2} />
        </span>
        <p className="font-display text-4xl font-bold tracking-tight text-white">
          {valor}
        </p>
        <p className="mt-2 text-sm font-medium text-white/75">{titulo}</p>
        {nota && <p className="mt-0.5 text-xs text-white/35">{nota}</p>}
      </div>
    </div>
  );
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Vista presentacional del dashboard (sin fetch: recibe los datos por props). */
export function DashboardView({
  kpis,
  serie,
  porVencer,
}: {
  kpis: KPIsDashboard | null;
  serie: IngresoMensual[];
  porVencer: Socio[];
}) {
  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descripcion="Resumen general de Wild Fitness"
      />

      {/* KPIs — iconos protagonistas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          titulo="Socios activos"
          valor={kpis ? kpis.sociosActivos : "—"}
          icon={Users}
          acento="emerald"
          nota="Membresías vigentes"
          delay={0}
        />
        <KpiTile
          titulo="Ingresos del mes"
          valor={kpis ? formatMXN(kpis.ingresosMes) : "—"}
          icon={DollarSign}
          acento="blood"
          nota="Membresías + tienda"
          delay={70}
        />
        <KpiTile
          titulo="Membresías por vencer"
          valor={kpis ? kpis.membresiasPorVencer : "—"}
          icon={AlarmClock}
          acento="amber"
          nota="En los próximos 5 días"
          delay={140}
        />
        <KpiTile
          titulo="Ventas de tienda hoy"
          valor={kpis ? formatMXN(kpis.ventasTiendaHoy) : "—"}
          icon={ShoppingBag}
          acento="sky"
          nota="Punto de venta"
          delay={210}
        />
      </div>

      {/* Gráfica + lista */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section
          style={{ animationDelay: "280ms" }}
          className="animate-fade-up rounded-[1.75rem] bg-ink-900/50 p-6 ring-1 ring-white/[0.04] lg:col-span-2"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blood-500/15 text-blood-400 ring-1 ring-inset ring-blood-400/25">
              <TrendingUp size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Ingresos · últimos 6 meses
              </h2>
              <p className="text-xs text-white/45">Membresías y tienda</p>
            </div>
          </div>
          {serie.length > 0 ? (
            <IngresosChart data={serie} />
          ) : (
            <div className="grid h-[300px] place-items-center text-sm text-white/30">
              Cargando gráfica…
            </div>
          )}
        </section>

        <section
          style={{ animationDelay: "340ms" }}
          className="animate-fade-up rounded-[1.75rem] bg-ink-900/50 p-6 ring-1 ring-white/[0.04]"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-400/25">
              <CalendarClock size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Por vencer
              </h2>
              <p className="text-xs text-white/45">Renovaciones esta semana</p>
            </div>
          </div>

          <div className="space-y-1">
            {porVencer.length === 0 && (
              <p className="py-8 text-center text-sm text-white/30">
                Sin vencimientos próximos 🎉
              </p>
            )}
            {porVencer.map((s) => {
              const dias = diasParaVencer(s.fechaVencimiento);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-white/[0.03]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/12 text-xs font-bold text-amber-400 ring-1 ring-inset ring-amber-500/20">
                    {iniciales(s.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {s.nombre}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatFecha(s.fechaVencimiento)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      dias <= 1
                        ? "bg-blood-500/15 text-blood-400"
                        : "bg-amber-500/15 text-amber-400"
                    )}
                  >
                    {dias === 0 ? "hoy" : `${dias} día${dias === 1 ? "" : "s"}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
