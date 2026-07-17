"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Check, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { getMembresiasPorVencer, marcarRecordatorioEnviado } from "@/lib/data";
import type { Socio } from "@/lib/types";
import { formatFecha, diasParaVencer } from "@/lib/utils";

function mensajeWhatsApp(s: Socio) {
  const nombre = s.nombre.split(" ")[0];
  return `Hola ${nombre} 👋 Tu membresía de Wild Fitness vence el ${formatFecha(
    s.fechaVencimiento
  )}. ¡Renueva para no perder tu acceso! 💪`;
}

export default function RecordatoriosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    getMembresiasPorVencer(5).then(setSocios);
  }, []);

  async function enviar(s: Socio) {
    setPreview(s.id);
    await marcarRecordatorioEnviado(s.id);
    setSocios((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, recordatorioEnviado: true } : x))
    );
  }

  return (
    <>
      <PageHeader
        titulo="Recordatorios"
        descripcion="Membresías que vencen en los próximos 5 días"
      />

      {/* Nota de contexto */}
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-200/80">
        <Info size={18} className="mt-0.5 shrink-0 text-sky-400" />
        <p>
          <span className="font-semibold text-sky-300">Vista previa</span> — en
          producción se envía automático cada día. Aquí solo se simula el envío.
        </p>
      </div>

      {socios.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-white/40">
            No hay membresías por vencer en los próximos 5 días. 🎉
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {socios.map((s) => {
            const dias = diasParaVencer(s.fechaVencimiento);
            const enviado = s.recordatorioEnviado;
            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{s.nombre}</p>
                    <p className="text-xs text-white/45">
                      {s.telefono} · Membresía {s.tipoMembresia}
                    </p>
                    <p className="mt-1 text-xs text-amber-400">
                      Vence {formatFecha(s.fechaVencimiento)} ·{" "}
                      {dias === 0
                        ? "hoy"
                        : `en ${dias} día${dias === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  {enviado ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400">
                      <Check size={14} />
                      Enviado
                    </span>
                  ) : (
                    <button
                      onClick={() => enviar(s)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </button>
                  )}
                </div>

                {/* Preview del mensaje */}
                {(preview === s.id || enviado) && (
                  <div className="mt-4 rounded-xl rounded-tl-sm border border-emerald-600/30 bg-emerald-950/30 p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500/70">
                      Vista previa del mensaje
                    </p>
                    <p className="text-sm leading-relaxed text-white/85">
                      {mensajeWhatsApp(s)}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
