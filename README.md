# Virtus | Obras — Sistema web + panel administrativo

Sitio público (landing premium) + panel de administración para gestión de clientes,
presupuestos con PDF, proyectos con fotos, y alertas de mantención.

**Stack:** React + Vite · Tailwind CSS · Supabase (DB + Auth + Storage) · Vercel (hosting + funciones serverless) · GitHub · CodeSandbox

---

## 1. Estructura del proyecto

```
src/
  admin/          → Panel administrativo (login, clientes, presupuestos, proyectos, mantenciones, mensajes, config)
  components/     → Componentes públicos del landing (Hero, Services, Gallery, WhatsApp, IA, etc.)
  pages/          → Landing.jsx (ensambla el sitio público)
  lib/            → Cliente Supabase, generador de PDF, formateadores
  assets/         → Logo, badge SEC, logo DuocUC, imagen de fondo
api/              → Funciones serverless de Vercel (email, push, asistente IA)
database/
  schema.sql      → Todo el modelo de datos para pegar en Supabase
```

---

## 2. Supabase (base de datos, login y fotos)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor → New query**, pega el contenido completo de `database/schema.sql` y ejecútalo.
   Esto crea todas las tablas, políticas de seguridad (RLS) y el bucket de fotos `proyecto-fotos`.
3. Ve a **Authentication → Users → Add user** y crea tu usuario (el correo y contraseña con los que
   entrarás a `/admin`). El sistema solo tiene un rol: administrador autenticado.
4. Ve a **Project Settings → API** y copia:
   - `Project URL` → va en `VITE_SUPABASE_URL`
   - `anon public key` → va en `VITE_SUPABASE_ANON_KEY`

---

## 3. Variables de entorno

Copia `.env.example` a `.env` y complétalo para desarrollo local:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_WHATSAPP_NUMBER=56912345678
```

Las variables que **solo van en Vercel** (nunca en el frontend, porque son secretas):

| Variable | Para qué sirve | Dónde se obtiene |
|---|---|---|
| `RESEND_API_KEY` | Enviar presupuestos y alertas por correo | [resend.com](https://resend.com) (plan gratis: 100 correos/día) |
| `RESEND_FROM_EMAIL` | Correo remitente (debe ser de un dominio verificado en Resend) | Tu dominio en Resend |
| `ONESIGNAL_APP_ID` / `ONESIGNAL_REST_API_KEY` | Notificación push al ingeniero | [onesignal.com](https://onesignal.com) → tu app |
| `GROQ_API_KEY` | Asistente de IA (gratis, sin tarjeta) | [console.groq.com](https://console.groq.com) |

---

## 4. GitHub

```bash
cd virtus-obras
git init
git add .
git commit -m "Sistema Virtus Obras: landing + panel admin"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/virtus-obras.git
git push -u origin main
```

Si prefieres, crea el repo vacío primero en GitHub (sin README) y luego corre lo de arriba.

---

## 5. CodeSandbox

1. En [codesandbox.io](https://codesandbox.io) → **Import from GitHub** → pega la URL de tu repo.
2. CodeSandbox detecta Vite automáticamente. Agrega las mismas variables `VITE_*` en
   **Server Control Panel → Environment Variables** para poder previsualizar con datos reales.
3. Desde ahí puedes seguir editando visualmente y los cambios se pueden volver a subir a GitHub
   (CodeSandbox tiene integración de commit directo a tu rama).

---

## 6. Vercel (producción)

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo de GitHub.
2. Framework preset: **Vite** (se detecta solo).
3. En **Environment Variables** agrega TODAS las variables de las secciones 3 (las `VITE_*`
   y las server-side de la tabla de arriba).
4. Deploy. Vercel construye el sitio y las funciones de `/api` automáticamente (no requiere
   configuración adicional: cualquier archivo en `/api/*.js` se convierte en un endpoint).
5. Cada vez que hagas `git push` a `main`, Vercel vuelve a desplegar solo.

---

## 7. Primer uso del panel

1. Entra a `tudominio.vercel.app/admin` y accede con el usuario creado en el paso 2.
2. Ve a **Configuración** y define el número de WhatsApp y los textos del hero.
3. Ve a **Clientes** y registra tu primer cliente (puedes usar los datos de ejemplo del
   formulario que enviaste como referencia: Marcela Ibáñez, Av. Vitacura 4380, etc.).
4. Ve a **Presupuestos → Nuevo presupuesto**, agrega ítems, guarda, descarga el PDF con el
   logo o envíalo directo al correo del cliente.
5. Ve a **Proyectos**, crea un proyecto, sube hasta 10 fotos con descripción, y marca
   "Mostrar en el carrusel" para que aparezca en la página principal.
6. Ve a **Mantenciones** cuando instales un equipo (ej. calefont): registra la fecha y la
   frecuencia, y el sistema calcula sola la próxima fecha. El botón "Notificar" dispara el
   correo al cliente y el push a ti vía OneSignal.

---

## 8. Notas de diseño

- Paleta: negro (`#0a0a0b`) + dorado (`#c9a227`) tomado directamente del logo Virtus.
- El logo se subió en baja resolución; se reescaló con filtro Lanczos + nitidez para mejorar
  su calidad de renderizado, pero para máxima nitidez en producción se recomienda pedir al
  diseñador original el archivo vectorial (.ai/.svg) del isotipo.
- Las credenciales (título DuocUC y certificación SEC) están enlazadas a los validadores
  oficiales por RUT, como pediste, para transparencia frente al cliente.
