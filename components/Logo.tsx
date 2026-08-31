import { cn } from "@/lib/utils";

/**
 * Marca Olimpo Gym: templo griego (frontón blanco + columnas en verde).
 * Usa el logo en /public/olimpologo.svg (fondo transparente, se ve
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
        src="/olimpologo.svg"
        alt="Olimpo Gym"
        width={64}
        height={64}
        className={cn("w-auto shrink-0 object-contain", dims.img)}
        style={{ filter: "drop-shadow(0 0 10px rgba(3,191,98,0.35))" }}
      />
      <div className="leading-none">
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-white",
            dims.text
          )}
        >
          Olimpo
        </span>
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-accent-500",
            dims.text
          )}
        >
          {" "}
          Gym
        </span>
      </div>
    </div>
  );
}
