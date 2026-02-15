# 08 - Gestión de Campañas y Atribución

Este módulo permite rastrear la fuente de adquisición de usuarios y gestionar campañas de marketing.

## Estructura del Sistema

1. **Backend**:
   - `Campaign` Model: Almacena códigos únicos de campaña y métricas.
   - `User` Model: Campo `acquisition` para guardar fuente, medio y fecha.
   - `analyticsService`: Gestiona la lógica de atribución usando Redis para sesiones temporales y Mongo para persistencia.
   - Endpoints:
     - `POST /api/analytics/attribution`: Endpoint público para registrar "clicks".
     - `POST /api/auth/register`: Inyecta la atribución guardada en Redis al crear un usuario.
     - `/api/panel/campaigns/*`: Endpoints protegidos para administración.

2. **Frontend**:
   - `useAttribution`: Hook que detecta parámetros URL (`?ref=`, `?source=`, etc) y comunica al backend.
   - Panel Admin:
     - `/panel/campaigns`: Listado, creación y toggle de estado.
     - `/panel/campaigns/:id`: Detalle y gráficos de rendimiento (Visitas/Conversiones diarias).

## Cómo usar

1. **Crear Campaña**: Ir al panel admin -> Campañas -> Nueva Campaña. Crear un código (ej: `verano2026`).
2. **Generar Link**: Añadir `?ref=verano2026` a cualquier URL de tu sitio. Ej: `misitio.com/landing?ref=verano2026`.
3. **Tracking**:
   - Cuando un usuario visita el link, el hook `useAttribution` envía el código al backend.
   - El backend valida el código y lo guarda en la sesión de Redis del usuario.
   - Se incrementa el contador de `visits` para el día actual.
4. **Conversión**:
   - Si el usuario se registra, el backend busca en su sesión de Redis.
   - Si encuentra datos de atribución, los guarda permanentemente en `User.acquisition`.
   - Se incrementa el contador de `conversions` para el día actual.

## Gráficos

El detalle de campaña muestra un gráfico de área comparando Visitas vs Conversiones a lo largo del tiempo, útil para medir el impacto de campañas en fechas específicas.

## Consideraciones Técnicas y Optimizaciones

Para garantizar la escalabilidad y precisión del sistema en un entorno de producción, se implementan las siguientes estrategias:

1.  **Persistencia de Atribución (Cookies + Redis)**:
    -   Se utiliza una cookie `HTTPOnly` de larga duración (30 días) llamada `attribution_ref` como mecanismo de respaldo principal.
    -   Esto asegura que si un usuario hace click en un anuncio pero se registra días después (cuando la sesión de Redis ya expiró), la atribución se mantenga correcta.

2.  **Filtrado de Tráfico (Anti-Bots)**:
    -   El endpoint de análisis filtra automáticamente las peticiones provenientes de bots, crawlers y spiders conocidos (analizando el `User-Agent`).
    -   Esto evita la inflación artificial de las métricas de "Visitas" generada por previsualizadores de redes sociales (OG Tags) o crawlers de motores de búsqueda.

3.  **Escalabilidad de Datos (Bucketing Pattern)**:
    -   Las métricas diarias NO se guardan dentro del documento `Campaign` para evitar el problema del "Documento Infinito".
    -   Se utiliza una colección separada `CampaignAnalytics` optimizada para series temporales, donde cada documento representa las métricas de un día (o un bucket de tiempo), facilitando consultas rápidas y archivado de datos antiguos.
