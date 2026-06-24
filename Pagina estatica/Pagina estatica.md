# 💃 Sistema de Administración — Grupo Jaltepec (Versión Estática)

Este es un sistema web estático interactivo diseñado específicamente para la gestión y administración interna del **Grupo de Danza Jaltepec**. El sistema centraliza la operación del grupo, permitiendo llevar un control estricto de accesos, miembros, asistencias a ensayos y la logística de utilería o vestuario en cada presentación.

Al estar construido como una aplicación puramente **estática**, destaca por su alta velocidad de respuesta, ligereza y portabilidad. Simula el comportamiento de una base de datos mediante la API nativa `localStorage` del navegador, lo que elimina por completo la necesidad de servidores web remotos o bases de datos relacionales tradicionales para su puesta en marcha inicial.

---

## 🚀 Módulos y Características Principales

1. **Autenticación Local y Roles de Acceso:**
   - Control de sesiones seguro gestionado localmente.
   - Distribución de permisos mediante dos roles definidos: `admin` (Administrador general con acceso total a la edición y configuración) e `integrante` (Acceso de consulta optimizado para los miembros del grupo).

2. **Gestión de Integrantes (Directorio Activo):**
   - CRUD (Crear, Leer, Actualizar, Eliminar) completo de los integrantes de la agrupación.
   - Almacenamiento de datos clave como fecha de nacimiento, fecha de ingreso al grupo y bitácora de observaciones médicas relevantes.

3. **Control y Registro de Asistencias:**
   - Listado dinámico por fechas y eventos particulares.
   - Monitoreo en tiempo real del estatus de asistencia de la plantilla de bailarines.

4. **Calendario y Agenda de Presentaciones:**
   - Registro cronológico de eventos, locaciones y detalles técnicos de las próximas puestas en escena.

5. **Inventario y Módulo de Asignación Logística:**
   - Control total sobre el stock de utilería, trajes regionales y accesorios, desglosados por cantidades disponibles y colores.
   - **Módulo de Auditoría:** Sistema integrado para asignar piezas específicas a presentaciones determinadas, facilitando el control y prevención de pérdidas de vestuario en campo.

6. **Dashboard Analítico Integral:**
   - Panel visual corporativo con métricas clave y resúmenes estadísticos.
   - Incorporación de gráficos interactivos dinámicos mediante **Chart.js** para visualizar las tendencias de asistencia y la distribución proporcional de ítems en el inventario.

---

## 🛠️ Stack Tecnológico Utilizado

- **HTML5:** Marcado semántico y estructura de vistas múltiples optimizadas mediante una arquitectura simulada de SPA (*Single Page Application*).
- **CSS3 Moderno:** Diseño responsivo y adaptable mediante variables nativas CSS (`:root`), transiciones fluidas de estado y una paleta de colores limpia y moderna basada en tonos cálidos y corporativos.
- **JavaScript (Vanilla JS):** Arquitectura limpia en JS puro encargado de la manipulación avanzada del DOM, control de eventos, lógica de negocio y mapeo relacional simulado.
- **Web Storage API (localStorage):** Capa de persistencia de datos local que simula transacciones CRUD de inserción y actualización directamente en el cliente.
- **Chart.js (CDN):** Librería externa de renderizado para gráficos en canvas de alto rendimiento.

---

## 📂 Estructura Arquitectónica del Repositorio

El proyecto mantiene una estructura modular y limpia, ideal para su distribución rápida:

```bash
danza-static/
├── index.html          # Interfaz única de usuario y contenedores de vistas dinámicas
├── app.js              # Núcleo del sistema: Control de vistas, lógica CRUD y persistencia
└── Imagen/             # Repositorio de recursos multimedia estáticos del sistema
    ├── Fondo.png       # Imagen de fondo estilizada para la pantalla de Login
    └── avatar.png      # Marcador de posición (placeholder) para perfiles de usuario
