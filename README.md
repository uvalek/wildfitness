# Wild Fitness — Sistema de gestión (Demo)

Demo funcional de gestión para gimnasio. Next.js (App Router) + TypeScript + Tailwind + recharts + lucide-react.

## Correr en local

```bash
npm install
npm run dev
# http://localhost:3000  → login con Supabase Auth (correo + contraseña)
```

## Autenticación

Login real con **Supabase Auth** (email + contraseña). El correo viene
prellenado; la contraseña la escribe el usuario. Las vistas del dashboard están
protegidas por [`components/AuthGuard.tsx`](components/AuthGuard.tsx): sin sesión
redirige a `/login`. La sesión persiste entre recargas y "Cerrar sesión" hace
`supabase.auth.signOut()`. Los usuarios se administran en Supabase → Authentication.

## Arquitectura de datos

**Toda** lectura/escritura pasa por una única capa: [`lib/data.ts`](lib/data.ts),
con funciones `async` conectadas a **Supabase** (proyecto *SuperCerebro*) mediante
[`lib/supabaseClient.ts`](lib/supabaseClient.ts). La UI nunca habla con la base directamente.

Tablas (prefijo `wf_` para aislarlas del resto del proyecto):

| Tabla                    | Contenido                                            |
| ------------------------ | ---------------------------------------------------- |
| `wf_socios`              | nombre, teléfono, tipo membresía, inicio, vencimiento |
| `wf_productos`           | inventario: nombre, categoría, precio, stock          |
| `wf_ventas`              | ventas de tienda (ingresos de punto de venta)         |
| `wf_checkins`            | accesos: socio, hora, estatus (permitido / no)        |
| `wf_precios_membresia`   | precios editables (Semanal $120 / Mensual $450 / Anual $3,800) |
| `wf_ingresos_mensuales`  | histórico de 6 meses para la gráfica                  |

- El estatus de membresía (Activa / Por vencer / Suspendida) se **calcula en vivo** por
  fecha (`calcularEstatus` en [`lib/utils.ts`](lib/utils.ts)); es un derivado, no se almacena.
  En accesos sí se guarda `membresia_vigente` (el estatus del acceso en ese momento).

## Modelo de membresías (regla de negocio)

- Al vencer, la membresía **no se cancela**: pasa a **Suspendida** (sin acceso). El socio
  nunca se borra.
- **Renovación** (`renovarMembresia` en [`lib/data.ts`](lib/data.ts), cálculo en
  `calcularRenovacion` de [`lib/utils.ts`](lib/utils.ts)): la nueva vigencia se cuenta
  **desde hoy si estaba suspendida** (no arrastra días muertos) o **desde el vencimiento
  actual si sigue vigente** (no pierde días ya pagados). Fórmula:
  `vencimiento = max(hoy, vencimiento_actual) + duración`.
  Ej: vencía 11 jun, renueva al volver el 13 jun (mensual) → nueva vigencia 13 jul.
- Botón **Renovar** disponible en Socios (para Suspendida / Por vencer) y en Check-in
  (cuando un socio suspendido llega al mostrador: renueva y da acceso en un paso).

## Base de datos (Supabase)

- Conexión vía [`.env.local`](.env.example) (`NEXT_PUBLIC_SUPABASE_URL` + llave publicable).
- Esquema y datos versionados en [`supabase/schema.sql`](supabase/schema.sql) y
  [`supabase/seed.sql`](supabase/seed.sql). **Re-ejecuta `seed.sql` para dejar la demo
  en estado limpio** (regenera fechas relativas a hoy).
- **RLS**: habilitado con políticas permisivas para el demo (panel sin login).
  Antes de producción hay que reemplazarlas por reglas basadas en `auth.uid()` / roles.

## Módulos

`/login` · `/dashboard` · `/socios` · `/checkin` · `/recordatorios` · `/tienda` · `/ingresos`

## Deploy en Vercel

Proyecto Next.js estándar, sin variables de entorno ni backend: `vercel` (o importar el repo).
