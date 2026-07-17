import { createClient } from "@supabase/supabase-js";

// Cliente único de Supabase para el navegador.
// Usa la URL y la llave publicable (seguras para el cliente; la seguridad
// real se aplica con Row Level Security en el proyecto).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.local)"
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
