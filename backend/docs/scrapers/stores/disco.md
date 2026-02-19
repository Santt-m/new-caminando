# Scraper: Disco

Implementación técnica para la extracción de datos del supermercado Disco (Cencosud).

## 1. Configuración General
- **ID de Tienda**: `disco`
- **Plataforma**: VTEX
- **Clases**: 
    - [DiscoHomeScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/disco/DiscoHomeScraper.ts) (Categorías)
    - [DiscoProductScraper](file:///home/santt/Documentos/GitHub/new-caminando/backend/src/scrapers/disco/DiscoProductScraper.ts) (Productos)

## 2. Endpoints de API Utilizados

### Árbol de Categorías
`GET https://www.disco.com.ar/api/catalog_system/pub/category/tree/3`

### Búsqueda de Productos
`GET https://www.disco.com.ar/api/catalog_system/pub/products/search?fq=C:${idPath}&_from=${from}&_to=${to}`
- **Paginación**: Bloques de 50. ID de categoría obligatorio para filtrar resultados.

## 3. Lógica de Variantes y Datos

### Identificación Global (EAN)
Disco utiliza el mismo motor de Cencosud. El proceso de vinculación es:
1. Detectar el EAN del primer item.
2. Usar `Product.findByEAN` para determinar si ya existe en otro supermercado (Vea/Jumbo).
3. Si existe, se añaden los datos de Disco como una nueva **Fuente (`Source`)** al producto existente.

### Mapeo de Campos Técnicos
| Campo Destino | Campo Origen (VTEX) |
| :--- | :--- |
| `ean` | `items[0].ean` |
| `name` | `productName` |
| `price` | `sellers[0].commertialOffer.Price` |
| `images` | `item.images[].imageUrl` |


## 4. Notas Técnicas
- Al igual que Jumbo y Vea, este scraper utiliza el motor centralizado de Node para realizar las peticiones de API, evitando la ejecución en el navegador remoto para mejorar la velocidad y estabilidad.
