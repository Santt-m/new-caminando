import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionProducts: ITranslation = {
    es: {
        // Page headers
        title: 'Gestión de Productos',
        subtitle: 'Administra el catálogo completo de productos',

        // Actions
        createProduct: 'Crear Producto',
        editProduct: 'Editar Producto',
        deleteProduct: 'Eliminar Producto',
        saveProduct: 'Guardar Producto',
        cancel: 'Cancelar',
        viewDetails: 'Ver Detalles',

        // Search and filters
        searchPlaceholder: 'Buscar por nombre, SKU o EAN...',
        filterByCategory: 'Categoría',
        filterByBrand: 'Marca',
        filterByStatus: 'Estado',
        allCategories: 'Todas las categorías',
        allBrands: 'Todas las marcas',
        allStatuses: 'Todos los estados',

        // Table headers
        tableImage: 'Imagen',
        tableName: 'Nombre',
        tableSKU: 'SKU',
        tablePrice: 'Precio',
        tableStock: 'Stock',
        tableCategory: 'Categoría',
        tableBrand: 'Marca',
        tableStatus: 'Estado',
        tableActions: 'Acciones',

        // Status
        statusAvailable: 'Disponible',
        statusUnavailable: 'No disponible',
        statusFeatured: 'Destacado',
        statusInStock: 'En stock',
        statusOutOfStock: 'Sin stock',
        statusLowStock: 'Stock bajo',

        // Form sections
        basicInfo: 'Información Básica',
        pricing: 'Precios y Stock',
        categorization: 'Categorización',
        images: 'Imágenes',
        variants: 'Variantes',
        seo: 'SEO y Metadata',

        // Form fields - Basic
        name: 'Nombre del Producto',
        namePlaceholder: 'Ej: iPhone 15 Pro Max',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Se genera automáticamente',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción detallada del producto...',

        // Form fields - Identifiers
        sku: 'SKU',
        skuPlaceholder: 'Código único del producto',
        ean: 'EAN/Código de Barras',
        eanPlaceholder: 'Código de barras opcional',

        // Form fields - Pricing
        price: 'Precio',
        pricePlaceholder: '0.00',
        discountPrice: 'Precio con Descuento',
        discountPricePlaceholder: 'Opcional',
        stock: 'Stock',
        stockPlaceholder: '0',

        // Form fields - Categorization
        category: 'Categoría Principal',
        categoryPlaceholder: 'Selecciona una categoría',
        subcategories: 'Subcategorías',
        subcategoriesPlaceholder: 'Selecciona subcategorías',
        brand: 'Marca',
        brandPlaceholder: 'Selecciona una marca',

        // Form fields - Images
        mainImages: 'Imágenes del Producto',
        uploadImages: 'Subir Imágenes',
        dragImages: 'Arrastra imágenes aquí o haz clic para seleccionar',
        maxImages: 'Máximo {{max}} imágenes',

        // Form fields - Variants
        hasVariants: 'Este producto tiene variantes',
        addVariant: 'Agregar Variante',
        removeVariant: 'Eliminar Variante',
        variantName: 'Nombre de la Variante',
        variantSKU: 'SKU de la Variante',
        variantPrice: 'Precio',
        variantStock: 'Stock',
        variantAttributes: 'Atributos',
        selectAttribute: 'Seleccionar atributo',
        attributeValue: 'Valor',

        // Variant configuration - NEW
        variantMode: 'Modo de Variantes',
        manualVariants: 'Crear Manual',
        autoVariants: 'Generar Automático',
        selectVariantAttributes: 'Selecciona atributos para variantes',
        generateCombinations: 'Generar Combinaciones',
        preview: 'Vista Previa',
        combinationsCount: '{{count}} combinaciones',
        variantImages: 'Imágenes de Variante',
        uploadVariantImages: 'Subir imágenes',
        applyToAll: 'Aplicar a Todas',
        enabledVariant: 'Habilitada',
        disabledVariant: 'Deshabilitada',
        enableVariant: 'Habilitar',
        disableVariant: 'Deshabilitar',
        noAttributesSelected: 'Selecciona al menos un atributo',
        maxVariantsReached: 'Máximo {{max}} variantes permitidas',
        duplicateSkuWarning: 'SKU duplicado detectado',

        // Form fields - Flags
        available: 'Producto Disponible',
        featured: 'Producto Destacado',

        // Messages
        loading: 'Cargando productos...',
        noProducts: 'No hay productos registrados',
        createSuccess: 'Producto creado exitosamente',
        updateSuccess: 'Producto actualizado exitosamente',
        deleteSuccess: 'Producto eliminado exitosamente',
        deleteConfirm: '¿Estás seguro de eliminar este producto?',
        deleteWarning: 'Esta acción no se puede deshacer',
        uploadingImages: 'Subiendo imágenes...',

        // Pagination
        previous: 'Anterior',
        next: 'Siguiente',
        pageInfo: 'Página {{page}} de {{total}}',
        showing: 'Mostrando {{from}} a {{to}} de {{total}} productos',

        // Validation
        nameRequired: 'El nombre es requerido',
        skuRequired: 'El SKU es requerido',
        priceRequired: 'El precio es requerido',
        priceInvalid: 'El precio debe ser mayor a 0',
        stockInvalid: 'El stock debe ser mayor o igual a 0',
        variantNameRequired: 'El nombre de la variante es requerido',
        atLeastOneImage: 'Debes subir al menos una imagen',
    },
    en: {
        // Page headers
        title: 'Product Management',
        subtitle: 'Manage the complete product catalog',

        // Actions
        createProduct: 'Create Product',
        editProduct: 'Edit Product',
        deleteProduct: 'Delete Product',
        saveProduct: 'Save Product',
        cancel: 'Cancel',
        viewDetails: 'View Details',

        // Search and filters
        searchPlaceholder: 'Search by name, SKU or EAN...',
        filterByCategory: 'Category',
        filterByBrand: 'Brand',
        filterByStatus: 'Status',
        allCategories: 'All categories',
        allBrands: 'All brands',
        allStatuses: 'All statuses',

        // Table headers
        tableImage: 'Image',
        tableName: 'Name',
        tableSKU: 'SKU',
        tablePrice: 'Price',
        tableStock: 'Stock',
        tableCategory: 'Category',
        tableBrand: 'Brand',
        tableStatus: 'Status',
        tableActions: 'Actions',

        // Status
        statusAvailable: 'Available',
        statusUnavailable: 'Unavailable',
        statusFeatured: 'Featured',
        statusInStock: 'In stock',
        statusOutOfStock: 'Out of stock',
        statusLowStock: 'Low stock',

        // Form sections
        basicInfo: 'Basic Information',
        pricing: 'Pricing and Stock',
        categorization: 'Categorization',
        images: 'Images',
        variants: 'Variants',
        seo: 'SEO and Metadata',

        // Form fields - Basic
        name: 'Product Name',
        namePlaceholder: 'E.g: iPhone 15 Pro Max',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Auto-generated',
        description: 'Description',
        descriptionPlaceholder: 'Detailed product description...',

        // Form fields - Identifiers
        sku: 'SKU',
        skuPlaceholder: 'Unique product code',
        ean: 'EAN/Barcode',
        eanPlaceholder: 'Optional barcode',

        // Form fields - Pricing
        price: 'Price',
        pricePlaceholder: '0.00',
        discountPrice: 'Discount Price',
        discountPricePlaceholder: 'Optional',
        stock: 'Stock',
        stockPlaceholder: '0',

        // Form fields - Categorization
        category: 'Main Category',
        categoryPlaceholder: 'Select a category',
        subcategories: 'Subcategories',
        subcategoriesPlaceholder: 'Select subcategories',
        brand: 'Brand',
        brandPlaceholder: 'Select a brand',

        // Form fields - Images
        mainImages: 'Product Images',
        uploadImages: 'Upload Images',
        dragImages: 'Drag images here or click to select',
        maxImages: 'Maximum {{max}} images',

        // Form fields - Variants
        hasVariants: 'This product has variants',
        addVariant: 'Add Variant',
        removeVariant: 'Remove Variant',
        variantName: 'Variant Name',
        variantSKU: 'Variant SKU',
        variantPrice: 'Price',
        variantStock: 'Stock',
        variantAttributes: 'Attributes',
        selectAttribute: 'Select attribute',
        attributeValue: 'Value',

        // Variant configuration - NEW
        variantMode: 'Variant Mode',
        manualVariants: 'Create Manual',
        autoVariants: 'Generate Automatic',
        selectVariantAttributes: 'Select attributes for variants',
        generateCombinations: 'Generate Combinations',
        preview: 'Preview',
        combinationsCount: '{{count}} combinations',
        variantImages: 'Variant Images',
        uploadVariantImages: 'Upload images',
        applyToAll: 'Apply to All',
        enabledVariant: 'Enabled',
        disabledVariant: 'Disabled',
        enableVariant: 'Enable',
        disableVariant: 'Disable',
        noAttributesSelected: 'Select at least one attribute',
        maxVariantsReached: 'Maximum {{max}} variants allowed',
        duplicateSkuWarning: 'Duplicate SKU detected',

        // Form fields - Flags
        available: 'Product Available',
        featured: 'Featured Product',

        // Messages
        loading: 'Loading products...',
        noProducts: 'No products registered',
        createSuccess: 'Product created successfully',
        updateSuccess: 'Product updated successfully',
        deleteSuccess: 'Product deleted successfully',
        deleteConfirm: 'Are you sure you want to delete this product?',
        deleteWarning: 'This action cannot be undone',
        uploadingImages: 'Uploading images...',

        // Pagination
        previous: 'Previous',
        next: 'Next',
        pageInfo: 'Page {{page}} of {{total}}',
        showing: 'Showing {{from}} to {{to}} of {{total}} products',

        // Validation
        nameRequired: 'Name is required',
        skuRequired: 'SKU is required',
        priceRequired: 'Price is required',
        priceInvalid: 'Price must be greater than 0',
        stockInvalid: 'Stock must be greater than or equal to 0',
        variantNameRequired: 'Variant name is required',
        atLeastOneImage: 'You must upload at least one image',
    },
    pt: {
        // Page headers
        title: 'Gestão de Produtos',
        subtitle: 'Gerencie o catálogo completo de produtos',

        // Actions
        createProduct: 'Criar Produto',
        editProduct: 'Editar Produto',
        deleteProduct: 'Excluir Produto',
        saveProduct: 'Salvar Produto',
        cancel: 'Cancelar',
        viewDetails: 'Ver Detalhes',

        // Search and filters
        searchPlaceholder: 'Buscar por nome, SKU ou EAN...',
        filterByCategory: 'Categoria',
        filterByBrand: 'Marca',
        filterByStatus: 'Status',
        allCategories: 'Todas as categorias',
        allBrands: 'Todas as marcas',
        allStatuses: 'Todos os status',

        // Table headers
        tableImage: 'Imagem',
        tableName: 'Nome',
        tableSKU: 'SKU',
        tablePrice: 'Preço',
        tableStock: 'Estoque',
        tableCategory: 'Categoria',
        tableBrand: 'Marca',
        tableStatus: 'Status',
        tableActions: 'Ações',

        // Status
        statusAvailable: 'Disponível',
        statusUnavailable: 'Indisponível',
        statusFeatured: 'Destaque',
        statusInStock: 'Em estoque',
        statusOutOfStock: 'Sem estoque',
        statusLowStock: 'Estoque baixo',

        // Form sections
        basicInfo: 'Informação Básica',
        pricing: 'Preços e Estoque',
        categorization: 'Categorização',
        images: 'Imagens',
        variants: 'Variantes',
        seo: 'SEO e Metadados',

        // Form fields - Basic
        name: 'Nome do Produto',
        namePlaceholder: 'Ex: iPhone 15 Pro Max',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Gerado automaticamente',
        description: 'Descrição',
        descriptionPlaceholder: 'Descrição detalhada do produto...',

        // Form fields - Identifiers
        sku: 'SKU',
        skuPlaceholder: 'Código único do produto',
        ean: 'EAN/Código de Barras',
        eanPlaceholder: 'Código de barras opcional',

        // Form fields - Pricing
        price: 'Preço',
        pricePlaceholder: '0.00',
        discountPrice: 'Preço com Desconto',
        discountPricePlaceholder: 'Opcional',
        stock: 'Estoque',
        stockPlaceholder: '0',

        // Form fields - Categorization
        category: 'Categoria Principal',
        categoryPlaceholder: 'Selecione uma categoria',
        subcategories: 'Subcategorias',
        subcategoriesPlaceholder: 'Selecione subcategorias',
        brand: 'Marca',
        brandPlaceholder: 'Selecione uma marca',

        // Form fields - Images
        mainImages: 'Imagens do Produto',
        uploadImages: 'Enviar Imagens',
        dragImages: 'Arraste imagens aqui ou clique para selecionar',
        maxImages: 'Máximo {{max}} imagens',

        // Form fields - Variants
        hasVariants: 'Este produto tem variantes',
        addVariant: 'Adicionar Variante',
        removeVariant: 'Remover Variante',
        variantName: 'Nome da Variante',
        variantSKU: 'SKU da Variante',
        variantPrice: 'Preço',
        variantStock: 'Estoque',
        variantAttributes: 'Atributos',
        selectAttribute: 'Selecionar atributo',
        attributeValue: 'Valor',

        // Variant configuration - NEW
        variantMode: 'Modo de Variantes',
        manualVariants: 'Criar Manual',
        autoVariants: 'Gerar Automático',
        selectVariantAttributes: 'Selecione atributos para variantes',
        generateCombinations: 'Gerar Combinações',
        preview: 'Visualização',
        combinationsCount: '{{count}} combinações',
        variantImages: 'Imagens da Variante',
        uploadVariantImages: 'Enviar imagens',
        applyToAll: 'Aplicar a Todas',
        enabledVariant: 'Habilitada',
        disabledVariant: 'Desabilitada',
        enableVariant: 'Habilitar',
        disableVariant: 'Desabilitar',
        noAttributesSelected: 'Selecione pelo menos um atributo',
        maxVariantsReached: 'Máximo {{max}} variantes permitidas',
        duplicateSkuWarning: 'SKU duplicado detectado',

        // Form fields - Flags
        available: 'Produto Disponível',
        featured: 'Produto Destaque',

        // Messages
        loading: 'Carregando produtos...',
        noProducts: 'Nenhum produto registrado',
        createSuccess: 'Produto criado com sucesso',
        updateSuccess: 'Produto atualizado com sucesso',
        deleteSuccess: 'Produto excluído com sucesso',
        deleteConfirm: 'Tem certeza que deseja excluir este produto?',
        deleteWarning: 'Esta ação não pode ser desfeita',
        uploadingImages: 'Enviando imagens...',

        // Pagination
        previous: 'Anterior',
        next: 'Próximo',
        pageInfo: 'Página {{page}} de {{total}}',
        showing: 'Mostrando {{from}} a {{to}} de {{total}} produtos',

        // Validation
        nameRequired: 'O nome é obrigatório',
        skuRequired: 'O SKU é obrigatório',
        priceRequired: 'O preço é obrigatório',
        priceInvalid: 'O preço deve ser maior que 0',
        stockInvalid: 'O estoque deve ser maior ou igual a 0',
        variantNameRequired: 'O nome da variante é obrigatório',
        atLeastOneImage: 'Você deve enviar pelo menos uma imagem',
    },
};
