# Compañía de Danza — App de administración

Aplicación de laboratorio para administrar integrantes, bailes, presentaciones,
cuadros, observaciones e inventario. Construida con **HTML/CSS/JavaScript puro**
que ejecuta **sentencias SQL crudas** contra Postgres en Supabase mediante una
función RPC.

> ⚠️ **Importante**: este proyecto es para laboratorio. Las credenciales de
> Supabase quedan expuestas en el navegador y cualquier persona con acceso a la
> URL puede ejecutar SQL arbitrario contra tu base de datos. No subir datos
> reales ni sensibles.

## Estructura

```
danza-app/
├── index.html              ← login
├── css/styles.css
├── js/
│   ├── config.js           ← URL y anon key de Supabase + helper execSQL
│   ├── auth.js             ← login/logout/sesión
│   ├── ui.js               ← navbar, modales, helpers de formato
│   └── crud.js             ← helpers genéricos para listar/borrar
├── pages/
│   ├── dashboard.html
│   ├── integrantes.html
│   ├── bailes.html
│   ├── presentaciones.html
│   ├── cuadros.html
│   ├── observaciones.html
│   └── inventario.html
├── sql/
│   └── setup_rpc.sql       ← función RPC exec_sql (ejecutar una vez)
└── vercel.json
```

## Configuración paso a paso

### 1. Crear las tablas y poblar datos

Ejecuta en el **SQL Editor** de Supabase, en este orden:

1. El script original de creación de tablas (`CREATE TABLE INTEGRANTE...`, etc.)
2. El script para agregar tablas de auth (`USUARIO`, `SESION`, `AUDIT_LOG`)
3. `datos_prueba.sql`
4. `datos_prueba_auth.sql`

### 2. Crear la función `exec_sql` en Supabase

En el SQL Editor de Supabase, ejecuta el archivo `sql/setup_rpc.sql`. Esto crea
una función única que permite ejecutar SQL crudo desde el navegador.

### 3. Resetear contraseñas para el lab

Los hashes en el seed son bcrypt simulados que no coinciden con SHA-256. Para
poder iniciar sesión, ejecuta una sola vez:

```sql
UPDATE usuario
   SET password_hash = encode(sha256('Password123!'::bytea), 'hex');
```

Esto pone la misma contraseña (`Password123!`) a todos los usuarios del seed.

### 4. Configurar credenciales en la app

Edita `js/config.js` y reemplaza con tus valores:

```javascript
export const SUPABASE_URL  = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON = 'TU_ANON_KEY';
```

Los encuentras en: Supabase Dashboard → Project Settings → API.

## Ejecutar en local

No necesitas Node ni nada que compile. Solo sirve la carpeta con un servidor
HTTP estático:

```bash
# Opción 1: Python
python3 -m http.server 3000

# Opción 2: npx (sin instalar nada)
npx serve -l 3000

# Opción 3: Live Server de VS Code (clic derecho en index.html)
```

Después abre `http://localhost:3000` en el navegador.

⚠️ No abras los archivos con `file://` — los módulos ES no funcionan sin servidor.

### Credenciales de prueba (después del paso 3)

- Email: `admin@compania.pe` (o cualquier email del seed)
- Password: `Password123!`

## Desplegar a Vercel

```bash
npm install -g vercel
cd danza-app
vercel
```

O conecta el repositorio de GitHub a Vercel y dale **Deploy**. Vercel detecta
que es un sitio estático y no requiere build step. `vercel.json` ya está
configurado con `cleanUrls`.

## Cómo funciona

Cada página HTML carga sus módulos JS, exige sesión (`requireAuth()`) y ejecuta
sentencias SQL crudas vía `execSQL('SELECT ...')`. Por debajo, eso llama a
`supabase.rpc('exec_sql', { query })`, que en Supabase ejecuta la sentencia y
devuelve el resultado como JSON.

Ejemplo, desde `pages/integrantes.html`:

```javascript
const { data, error } = await execSQL(`
  SELECT * FROM integrante ORDER BY id ASC
`);
```

Todas las inserciones y modificaciones se registran en `audit_log` con la
acción, el usuario, la tabla y los datos en `detalle` (JSONB).

## Limitaciones conocidas (porque es laboratorio)

- Las credenciales (anon key) se ven en el código del navegador
- Cualquier visitante puede ejecutar `DROP TABLE` desde la consola
- El "JWT" es solo un base64 — no está firmado, se puede modificar
- El hash de contraseñas es SHA-256 sin salt (jamás usar así en producción)

