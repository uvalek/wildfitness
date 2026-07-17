import { cn } from "@/lib/utils";

/** Contenedor base con estilo de tarjeta oscura premium. */
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-700/60 bg-ink-900/70 p-5 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
