# Scraper: Carrefour

Implementación técnica para la extracción de datos de Carrefour Argentina.

## 1. Configuración General
- **ID de Tienda**: `carrefour`
- **Plataforma**: VTEX
- **Clases**: 
    - [CarrefourHomeScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/carrefour/CarrefourHomeScraper.ts) (Categorías)
    - [CarrefourProductScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/carrefour/CarrefourProductScraper.ts) (Productos)

## 2. Endpoints de API Utilizados

### Árbol de Categorías
`GET https://www.carrefour.com.ar/api/catalog_system/pub/category/tree/3`

### Búsqueda de Productos
`GET https://www.carrefour.com.ar/api/catalog_system/pub/products/search?fq=C:${idPath}&_from=${from}&_to=${to}`

## 3. Lógica de Sincronización

### Estabilidad y Anti-Bots
Carrefour implementa medidas de seguridad estrictas. Para mitigar bloqueos:
- Se utiliza el **Node Context de Playwright** para interceptar peticiones.
- Se emulan cabeceras de navegador real.
- El intervalo de capturas de pantalla ayuda a depurar si el sitio muestra un "Challenge" de seguridad.

### Mapeo de Campos Técnicos
| Campo Destino | Campo Origen (VTEX) | Notas |
| :--- | :--- | :--- |
| `ean` | `items[0].ean` | Vínculo maestro |
| `name` | `productName` | |
| `price` | `sellers[0].commertialOffer.Price` | Precio final |
| `sku` | `items[0].itemId` | ID de Carrefour |
| `images` | `items[0].images[].imageUrl` | |


## 4. Diferenciación y Vinculación
- **Vinculación por EAN**: Cruza exitosamente con productos de Cencosud (Vea, Jumbo, Disco) si el código de barras coincide.
- **Estabilidad**: Migrado al contexto de Node para prevenir bloqueos por parte de los servicios de protección de Carrefour.
