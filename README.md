# Proyecto Full-Stack Serverless Template

Bienvenido a la plantilla de proyecto Full-Stack optimizada para entornos serverless. Este proyecto combina un backend robusto en Node.js/Express con un frontend premium en React/Vite, diseñado para ser escalable, seguro y fácil de mantener.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- MongoDB (Atlas o Local)
- Redis (Upstash o Local)
- Cloudinary (Cuenta para gestión de imágenes)

### Instalación
1. Clona el repositorio.
2. Configura los archivos `.env` en `/backend` y `/frontend`.
3. Instala las dependencias:
   ```bash
   # En la raíz, backend y frontend
   npm install
   ```

### Ejecución en Desarrollo
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## 🛠 Stack Tecnológico

- **Frontend**: React 19, Vite, Tailwind CSS 4, Radix UI, Shadcn/UI, TanStack Query.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Redis, TypeScript.
- **Infraestructura**: Optimizado para Vercel (Frontend/API) y Railway.
- **Servicios**: Cloudinary (Media), Upstash (Redis).

## 📖 Documentación Detallada

Para comprender a fondo el funcionamiento del sistema, consulta la carpeta [`/docs`](./docs):

1.  **[Arquitectura y Stack](./docs/01-arquitectura-y-stack.md)**: Visión general y optimización serverless.
2.  **[Autenticación y Sesión](./docs/02-autenticacion-y-sesion.md)**: Flujo de identidad y seguridad de acceso.
3.  **[Gestión de Imágenes](./docs/03-gestion-de-imagenes.md)**: Integración con Cloudinary y tracking.
4.  **[Seguridad Avanzada](./docs/04-seguridad-avanzada.md)**: Protección de rutas y reglas de IP.
5.  **[Monitoreo y Tracking](./docs/05-monitoreo-y-tracking.md)**: Auditoría y analíticas de actividad.
6.  **[Gestión de Bases de Datos](./docs/06-gestion-de-bases-de-datos.md)**: Herramientas administrativas integradas.
7.  **[Gestión de Usuarios](./docs/07-gestion-de-usuarios.md)**: Perfiles, roles y administración.
8.  **[Marketing y Campañas](./docs/08-marketing-campaigns.md)**: Atribución y rendimiento de marketing.
9.  **[Sistema de Soporte](./docs/09-sistema-de-soporte-tickets.md)**: Gestión integral de tickets.
10. **[Configuración del Sistema](./docs/10-configuracion-del-sistema.md)**: Ajustes globales y entorno.
11. **[Guía de Desarrollador](./docs/11-guia-de-desarrollador.md)**: Estándares, despliegue y seeds.
12. **[Gestión de Emails](./docs/12-gestion-de-emails.md)**: Plantillas, trazabilidad y Sentinel.

---
Desarrollado con ❤️ para escalabilidad extrema.
