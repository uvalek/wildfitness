"use client";

import { useEffect, useState } from "react";
import { Wallet, CreditCard, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { KpiCard } from "@/components/KpiCard";
import { IngresosChart } from "@/components/IngresosChart";
import { getResumenIngresos, getPreciosMembresia } from "@/lib/data";
import type { ResumenIngresos, TipoMembresia } from "@/lib/types";
import { formatMXN, cn } from "@/lib/utils";

const PRECIOS_DEFAULT: Record<TipoMembresia, number> = {
  Semanal: 100,
  Quincenal: 180,
  Mensual: 300,
  Anual: 3000,
};

export default function IngresosPage() {
  const [resumen, setResumen] = useState<ResumenIngresos | null>(null);
  const [precios, setPrecios] =
    useState<Record<TipoMembresia, number>>(PRECIOS_DEFAULT);

  useEffect(() => {
    getResumenIngresos().then(setResumen);
    getPreciosMembresia().then(setPrecios);
  }, []);

  const maxMonto = resumen
    ? Math.max(...resumen.desglosePorMembresia.map((d) => d.monto), 1)
    : 1;

  return (
    <>
      <PageHeader
        titulo="Ingresos"
        descripcion="Membresías + tienda · mes en curso"
      />

      {/* KPIs de ingreso */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          titulo="Total del mes"
          valor={resumen ? formatMXN(resumen.totalMes) : "—"}
          icon={Wallet}
          acento="blood"
        />
        <KpiCard
          titulo="Membresías"
          valor={resumen ? formatMXN(resumen.totalMembresias) : "—"}
          icon={CreditCard}
          acento="emerald"
        />
        <KpiCard
          titulo="Tienda"
          valor={resumen ? formatMXN(resumen.totalTienda) : "—"}
          icon={ShoppingBag}
          acento="sky"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfica */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
            Evolución · 6 meses
          </h2>
          {resumen ? (
            <IngresosChart data={resumen.serie} />
          ) : (
            <div className="grid h-[300px] place-items-center text-sm text-white/30">
              Cargando…
            </div>
          )}
        </Card>

        {/* Desglose por tipo de membresía */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
            Membresías por tipo
          </h2>
          <div className="space-y-4">
            {resumen?.desglosePorMembresia.map((d) => (
              <div key={d.tipo}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-white">
                    {d.tipo}{" "}
                    <span className="text-white/40">
                      · {d.cantidad} × {formatMXN(precios[d.tipo])}
                    </span>
                  </span>
                  <span className="font-semibold text-white">
                    {formatMXN(d.monto)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r from-blood-500 to-blood-700"
                    )}
                    style={{ width: `${(d.monto / maxMonto) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {resumen && (
            <div className="mt-6 border-t border-ink-800 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Ventas de tienda (hoy)</span>
                <span className="font-semibold text-white">
                  {formatMXN(resumen.totalTienda)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-sm font-bold uppercase tracking-wide text-white/70">
                  Total
                </span>
                <span className="font-display text-xl font-bold text-blood-400">
                  {formatMXN(resumen.totalMes)}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
