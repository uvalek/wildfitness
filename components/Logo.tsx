import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: { box: "h-8 w-8", icon: 18, text: "text-lg" },
    md: { box: "h-10 w-10", icon: 22, text: "text-xl" },
    lg: { box: "h-14 w-14", icon: 30, text: "text-3xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-glow",
          dims.box
        )}
      >
        <Dumbbell size={dims.icon} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-white",
            dims.text
          )}
        >
          Wild
        </span>
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-blood-500",
            dims.text
          )}
        >
          {" "}
          Fitness
        </span>
      </div>
    </div>
  );
}
