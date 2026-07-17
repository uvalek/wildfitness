import { createClient } from "@supabase/supabase-js";

// Cliente único de Supabase para el navegador.
// Usa la URL y la llave publicable (seguras para el cliente; la seguridad
// real se aplica con Row Level Security en el proyecto).
// Normaliza la URL: el cliente de Supabase espera SOLO la URL base del
// proyecto (https://xxxx.supabase.co). Si por error se incluye "/rest/v1"
// o una barra final, lo quitamos para evitar "Invalid path in request URL".
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const url = rawUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/rest\/v1$/, "")
  .replace(/\/+$/, "");
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

// No lanzamos error en tiempo de build/prerender (rompería el deploy si las
// variables aún no están configuradas). Solo avisamos en el navegador.
if ((!url || !key) && typeof window !== "undefined") {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Configúralas en Vercel (Project Settings → Environment Variables)."
  );
}

export const supabase = createClient(url, key, {
  auth: {
    // La sesión se guarda en el navegador y se refresca sola, así el login
    // sobrevive a recargas y navegación entre vistas.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
