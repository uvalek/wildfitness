"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, AlarmClock, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { IngresosChart } from "@/components/IngresosChart";
import {
  getKPIsDashboard,
  getIngresosMensuales,
  getMembresiasPorVencer,
} from "@/lib/data";
import type { KPIsDashboard, IngresoMensual, Socio } from "@/lib/types";
import { formatMXN, formatFecha, diasParaVencer, calcularEstatus } from "@/lib/utils";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIsDashboard | null>(null);
  const [serie, setSerie] = useState<IngresoMensual[]>([]);
  const [porVencer, setPorVencer] = useState<Socio[]>([]);

  useEffect(() => {
    getKPIsDashboard().then(setKpis);
    getIngresosMensuales().then(setSerie);
    getMembresiasPorVencer(7).then(setPorVencer);
  }, []);

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descripcion="Resumen general de Wild Fitness"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          titulo="Socios activos"
          valor={kpis ? kpis.sociosActivos : "—"}
          icon={Users}
          acento="emerald"
          nota="Membresías vigentes"
        />
        <KpiCard
          titulo="Ingresos del mes"
          valor={kpis ? formatMXN(kpis.ingresosMes) : "—"}
          icon={DollarSign}
          acento="blood"
          nota="Membresías + tienda"
        />
        <KpiCard
          titulo="Membresías por vencer"
          valor={kpis ? kpis.membresiasPorVencer : "—"}
          icon={AlarmClock}
          acento="amber"
          nota="En los próximos 5 días"
        />
        <KpiCard
          titulo="Ventas de tienda hoy"
          valor={kpis ? formatMXN(kpis.ventasTiendaHoy) : "—"}
          icon={ShoppingBag}
          acento="sky"
          nota="Punto de venta"
        />
      </div>

      {/* Gráfica + lista */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Ingresos · últimos 6 meses
              </h2>
              <p className="text-xs text-white/50">Membresías y tienda</p>
            </div>
          </div>
          {serie.length > 0 ? (
            <IngresosChart data={serie} />
          ) : (
            <div className="grid h-[300px] place-items-center text-sm text-white/30">
              Cargando gráfica…
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Por vencer esta semana
          </h2>
          <p className="mb-4 text-xs text-white/50">Renovaciones próximas</p>

          <div className="space-y-3">
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
                  className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-850/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {s.nombre}
                    </p>
                    <p className="text-xs text-white/45">
                      Vence {formatFecha(s.fechaVencimiento)} ·{" "}
                      {dias === 0 ? "hoy" : `en ${dias} día${dias === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <StatusBadge estatus={calcularEstatus(s.fechaVencimiento)} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
