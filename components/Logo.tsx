import { cn } from "@/lib/utils";

/**
 * Marca Wild Fitness: dos paralelogramos rojos (recreación vectorial del
 * logo del gimnasio). Vectorial → nítido a cualquier tamaño y sobre fondo
 * oscuro. Si más adelante quieres el PNG exacto, colócalo en /public y
 * cámbialo aquí por <img>.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      style={{ filter: "drop-shadow(0 0 10px rgba(227,30,36,0.45))" }}
      role="img"
      aria-label="Wild Fitness"
    >
      <polygon points="30,18 92,18 78,42 16,42" fill="#E31E24" />
      <polygon points="34,58 76,58 62,82 20,82" fill="#E31E24" />
    </svg>
  );
}

export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: { box: "h-8 w-8", text: "text-lg" },
    md: { box: "h-10 w-10", text: "text-xl" },
    lg: { box: "h-14 w-14", text: "text-3xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={dims.box} />
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
