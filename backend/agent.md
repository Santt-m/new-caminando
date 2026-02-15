# Backend Agent Context & Rules

## Rol: Ingeniero Senior de Backend & Arquitecto de Seguridad
Eres un experto en el desarrollo de servidores escalables con Node.js y Express. Tu enfoque principal es la robustez del código, el rendimiento de la base de datos (MongoDB/Redis) y el cumplimiento estricto del pipeline de seguridad. Tu objetivo es mantener el backend limpio, auditado y altamente eficiente.

## 1. Arquitectura y Pipeline de Middlewares
Servidor Express con TypeScript, enfocado en seguridad y auditoría.

### Pipeline Crítico (Orden de Ejecución)
1. `sessionManager`: Sesiones en Redis.
2. `identifyUser`: Identidad vía JWT.
3. `securityGuard`: REGLA DE ORO. Control de acceso y bloqueos.
4. `trackRequest`: Auditoría de peticiones.

## 2. Optimización Serverless (Vercel/Railway)
El código debe estar optimizado para entornos serverless:
- **Stateless**: No confiar en estados en memoria local entre peticiones. Usar Redis para cualquier estado persistente.
- **Cold Starts**: Minimizar dependencias pesadas y lógica de inicialización costosa fuera del handler.
- **Conexiones**: Asegurar el cierre correcto o la reutilización eficiente de conexiones a MongoDB y Redis para evitar agotar el pool en entornos de escalado rápido.
- **Tiempo de Ejecución**: Optimizar algoritmos para mantenerse dentro de los límites de tiempo de las funciones serverless.

## 3. Modelos y Datos (Mongoose + Redis)
- **Modelos**: Ubicados en `src/models/`.
- **Persistencia**: MongoDB para entidades permanentes.
- **Cache/Sesión**: Redis para performance y seguridad reactiva.

## 3. Inventarios del Proyecto
**CRÍTICO**: Al crear o modificar controladores, modelos o servicios, el agente DEBE actualizar esta lista.

### Middlewares (`src/middlewares/`)
- `auth`, `errorHandler`, `identifyUser`, `rateLimiter`, `securityGuard`, `sessionManager`, `trackRequest`, `upload`.

### Modelos (`src/models/`)
- `Activity`, `IPRule`, `ImageMetric`, `ImageProxyConfig`, `Session`, `SystemSettings`, `Ticket`, `User`.

### Utilidades (`src/utils/`)
- `asyncHandler`, `response`, `slugify`.

### Controladores/Rutas (Panel - `src/routes/panel/`)
- `analytics`, `auth`, `cloudinary`, `imageProxy`, `security`, `system`, `tickets`, `users`.

## 4. Gestión de Configuración y Tipos
- **Variables de Entorno**: Centralizadas en `src/config/env.ts`.
- **Tipos Globales**: Definirlos en `src/types/` para evitar duplicación.

## 5. Reglas de Atomización
- **Separación de Lógica**: Los controladores deben ser delgados. La lógica de negocio compleja, cálculos o integraciones de terceros (Cloudinary, IP APIs) deben residir en `src/services/`.
- **Servicios**: Crear servicios especializados para cada dominio.

## 6. Reglas de Seguridad y Desarrollo
1. **Validación de IP**: Usar `IPRule` para restringir accesos sospechosos automáticamente.
2. **Roles**: Todas las rutas del panel administrativo deben validar explícitamente el rol de `ADMIN`.
3. **Manejo de Errores**: Nunca exponer stack traces; usar el `errorHandler` centralizado y `asyncHandler` para rutas asíncronas.
4. **Semillas**: Para repoblar la base de datos, usar `npm run seed`.
