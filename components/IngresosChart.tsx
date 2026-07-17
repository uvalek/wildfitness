"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { IngresoMensual } from "@/lib/types";
import { formatMXN } from "@/lib/utils";

export function IngresosChart({ data }: { data: IngresoMensual[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradMembresias" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#b80000" />
          </linearGradient>
          <linearGradient id="gradTienda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b5b66" />
            <stop offset="100%" stopColor="#33333b" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#26262c" vertical={false} />
        <XAxis
          dataKey="mes"
          stroke="#7a7a85"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          className="capitalize"
        />
        <YAxis
          stroke="#7a7a85"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#141417",
            border: "1px solid #2a2a31",
            borderRadius: 12,
            color: "#fff",
          }}
          labelStyle={{ color: "#fff", fontWeight: 600, textTransform: "capitalize" }}
          formatter={(value: number, name: string) => [
            formatMXN(value),
            name === "membresias" ? "Membresías" : "Tienda",
          ]}
        />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-white/60">
              {value === "membresias" ? "Membresías" : "Tienda"}
            </span>
          )}
        />
        <Bar
          dataKey="membresias"
          stackId="a"
          fill="url(#gradMembresias)"
          radius={[0, 0, 0, 0]}
          maxBarSize={46}
          isAnimationActive={false}
        />
        <Bar
          dataKey="tienda"
          stackId="a"
          fill="url(#gradTienda)"
          radius={[6, 6, 0, 0]}
          maxBarSize={46}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
