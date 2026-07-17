import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  titulo,
  valor,
  icon: Icon,
  acento = "blood",
  nota,
}: {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  acento?: "blood" | "emerald" | "amber" | "sky";
  nota?: string;
}) {
  const acentos = {
    blood: "from-blood-500/20 text-blood-400 ring-blood-500/30",
    emerald: "from-emerald-500/20 text-emerald-400 ring-emerald-500/30",
    amber: "from-amber-500/20 text-amber-400 ring-amber-500/30",
    sky: "from-sky-500/20 text-sky-400 ring-sky-500/30",
  }[acento];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/70 p-5 backdrop-blur transition hover:border-ink-600">
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125",
          acentos
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">
            {titulo}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-white">
            {valor}
          </p>
          {nota && <p className="mt-1 text-xs text-white/40">{nota}</p>}
        </div>
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl bg-ink-800 ring-1 ring-inset",
            acentos
          )}
        >
          <Icon size={20} strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}
