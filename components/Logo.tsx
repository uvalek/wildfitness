import { cn } from "@/lib/utils";

/**
 * Marca Wild Fitness: monograma "WF" (W blanca + F roja).
 * Usa el logo real en /public/wildfitlogo.png (fondo transparente, se ve
 * bien sobre el fondo oscuro del panel).
 */
export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: { img: "h-7", text: "text-base" },
    md: { img: "h-8", text: "text-lg" },
    lg: { img: "h-12", text: "text-3xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/wildfitlogo.png"
        alt="Wild Fitness"
        width={1090}
        height={599}
        className={cn("w-auto shrink-0 object-contain", dims.img)}
        style={{ filter: "drop-shadow(0 0 10px rgba(227,30,36,0.35))" }}
      />
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
