"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "@/components/DashboardView";
import {
  getKPIsDashboard,
  getIngresosMensuales,
  getMembresiasPorVencer,
} from "@/lib/data";
import type { KPIsDashboard, IngresoMensual, Socio } from "@/lib/types";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIsDashboard | null>(null);
  const [serie, setSerie] = useState<IngresoMensual[]>([]);
  const [porVencer, setPorVencer] = useState<Socio[]>([]);

  useEffect(() => {
    getKPIsDashboard().then(setKpis);
    getIngresosMensuales().then(setSerie);
    getMembresiasPorVencer(7).then(setPorVencer);
  }, []);

  return <DashboardView kpis={kpis} serie={serie} porVencer={porVencer} />;
}
