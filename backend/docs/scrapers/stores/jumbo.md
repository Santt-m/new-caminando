# Scraper: Jumbo

Implementación técnica para la extracción de datos del supermercado Jumbo (Cencosud).

## 1. Configuración General
- **ID de Tienda**: `jumbo`
- **Plataforma**: VTEX
- **Clases**: 
    - [JumboHomeScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/jumbo/JumboHomeScraper.ts) (Categorías)
    - [JumboProductScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/jumbo/JumboProductScraper.ts) (Productos)

## 2. Endpoints de API Utilizados

### Árbol de Categorías
`GET https://www.jumbo.com.ar/api/catalog_system/pub/category/tree/3`

### Búsqueda de Productos
`GET https://www.jumbo.com.ar/api/catalog_system/pub/products/search?fq=C:${idPath}&_from=${from}&_to=${to}`
- **Paginación**: Bloques de 50 productos. Límite máximo de exploración: 2500 productos.

## 3. Lógica de Variantes y Datos

### Procesamiento de Variantes
Al igual que en otros scrapers de Cencosud, se procesa el array de `items` para identificar variaciones del mismo producto:
- Se sincroniza el `itemId` de Jumbo con nuestro campo `sku`.
- Se captura el `AvailableQuantity` para determinar la disponibilidad en tiempo real.

### Mapeo de Campos Técnicos
| Campo Destino | Campo Origen (VTEX) | Notas |
| :--- | :--- | :--- |
| `name` | `productName` | |
| `ean` | `items[0].ean` | Identificador global |
| `sku` | `items[0].itemId` | ID local de Jumbo |
| `price` | `sellers[0].commertialOffer.Price` | |
| `available` | `AvailableQuantity > 0` | |
| `images` | `item.images[].imageUrl` | Galería completa de imágenes |


## 4. Notas Técnicas
- Comparte la misma estructura de VTEX que Vea y Disco.
- Implementa vinculación prioritaria por EAN para alimentar el sistema de comparación de precios compartidos.
