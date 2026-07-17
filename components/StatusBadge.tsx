import type { EstatusMembresia } from "@/lib/types";
import { cn } from "@/lib/utils";

const ESTILOS: Record<EstatusMembresia, string> = {
  Activa: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  "Por vencer": "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  Suspendida: "bg-blood-500/15 text-blood-400 ring-blood-500/30",
};

const PUNTO: Record<EstatusMembresia, string> = {
  Activa: "bg-emerald-400",
  "Por vencer": "bg-amber-400",
  Suspendida: "bg-blood-500",
};

export function StatusBadge({ estatus }: { estatus: EstatusMembresia }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        ESTILOS[estatus]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", PUNTO[estatus])} />
      {estatus}
    </span>
  );
}
