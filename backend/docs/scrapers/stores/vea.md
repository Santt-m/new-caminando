# Scraper: Vea

Implementación técnica para la extracción de datos del supermercado Vea (Cencosud).

## 1. Configuración General
- **ID de Tienda**: `vea`
- **Plataforma**: VTEX
- **Clases**: 
    - [VeaHomeScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/vea/VeaHomeScraper.ts) (Categorías)
    - [VeaProductScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/vea/VeaProductScraper.ts) (Productos)

## 2. Endpoints de API Utilizados

### Árbol de Categorías
`GET https://www.vea.com.ar/api/catalog_system/pub/category/tree/3`
Extrae los niveles de categorías para sincronizar nuestro modelo [Category](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/models/Category.ts).

### Búsqueda de Productos
`GET https://www.vea.com.ar/api/catalog_system/pub/products/search?fq=C:${idPath}&_from=${from}&_to=${to}`
- **fq=C**: Filtra por el path de IDs de categoría (ej: `1/18/139`). Es fundamental para navegar subcategorías en VTEX.
- **Paginación**: Se utiliza un bucle `while` que incrementa los valores `_from` y `_to` en bloques de 50. El límite de seguridad está fijado en 2000 productos para evitar bloqueos por IP.

## 3. Lógica de Variantes y Datos

### Extracción de Variantes (SKUs)
Un producto en VTEX puede tener múltiples presentaciones (ej: diferentes tamaños o sabores). El scraper recorre el array `items` de la respuesta JSON:
- Cada item se guarda como una **variante** en nuestro modelo.
- Se extrae el `itemId` como nuestro `sku` interno.
- El `price` se obtiene de la oferta comercial (`commertialOffer`) del vendedor predeterminado (`sellerDefault`).

### Mapeo de Campos Técnicos
| Campo Destino | Campo Origen (VTEX) | Notas |
| :--- | :--- | :--- |
| `name` | `productName` | Nombre principal del producto |
| `ean` | `items[0].ean` | Código de barras para vinculación |
| `price` | `commertialOffer.Price` | Precio de la oferta actual |
| `images` | `items[0].images[].imageUrl` | Array de URLs de alta resolución |
| `packageSize` | `unitMultiplier + measurementUnit` | Ej: "500 gr" |


## 4. Notas Técnicas
- **Aislamiento**: Las peticiones de API se realizan desde el contexto de Node para mayor fiabilidad.
- **Relación de Productos**: Si un producto comparte EAN con otro supermercado, se vincula automáticamente permitiendo la comparación de precios.
