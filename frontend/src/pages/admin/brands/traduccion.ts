import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionBrands: ITranslation = {
    es: {
        // Page headers
        title: 'Gestión de Marcas',
        subtitle: 'Administra las marcas de productos disponibles en el catálogo',

        // Actions
        createBrand: 'Crear Marca',
        editBrand: 'Editar Marca',
        deleteBrand: 'Eliminar Marca',
        saveBrand: 'Guardar Marca',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar marcas...',

        // Table headers
        tableLogo: 'Logo',
        tableName: 'Nombre',
        tableSlug: 'Slug',
        tableProducts: 'Productos',
        tableStatus: 'Estado',
        tableActions: 'Acciones',

        // Status
        statusActive: 'Activa',
        statusInactive: 'Inactiva',

        // Form fields
        name: 'Nombre',
        namePlaceholder: 'Ej: Samsung, Nike, Apple...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Se genera automáticamente',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción opcional de la marca...',
        logo: 'Logo',
        uploadLogo: 'Subir Logo',
        active: 'Marca Activa',

        // Messages
        loading: 'Cargando marcas...',
        noBrands: 'No hay marcas registradas',
        createSuccess: 'Marca creada exitosamente',
        updateSuccess: 'Marca actualizada exitosamente',
        deleteSuccess: 'Marca eliminada exitosamente',
        deleteConfirm: '¿Estás seguro de eliminar esta marca?',
        deleteWarning: 'Esta acción no se puede deshacer',

        // Pagination
        previous: 'Anterior',
        next: 'Siguiente',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'El nombre es requerido',
        nameMinLength: 'El nombre debe tener al menos 2 caracteres',
    },
    en: {
        // Page headers
        title: 'Brand Management',
        subtitle: 'Manage product brands available in the catalog',

        // Actions
        createBrand: 'Create Brand',
        editBrand: 'Edit Brand',
        deleteBrand: 'Delete Brand',
        saveBrand: 'Save Brand',
        cancel: 'Cancel',

        // Search and filters
        searchPlaceholder: 'Search brands...',

        // Table headers
        tableLogo: 'Logo',
        tableName: 'Name',
        tableSlug: 'Slug',
        tableProducts: 'Products',
        tableStatus: 'Status',
        tableActions: 'Actions',

        // Status
        statusActive: 'Active',
        statusInactive: 'Inactive',

        // Form fields
        name: 'Name',
        namePlaceholder: 'E.g: Samsung, Nike, Apple...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Auto-generated',
        description: 'Description',
        descriptionPlaceholder: 'Optional brand description...',
        logo: 'Logo',
        uploadLogo: 'Upload Logo',
        active: 'Active Brand',

        // Messages
        loading: 'Loading brands...',
        noBrands: 'No brands registered',
        createSuccess: 'Brand created successfully',
        updateSuccess: 'Brand updated successfully',
        deleteSuccess: 'Brand deleted successfully',
        deleteConfirm: 'Are you sure you want to delete this brand?',
        deleteWarning: 'This action cannot be undone',

        // Pagination
        previous: 'Previous',
        next: 'Next',
        pageInfo: 'Page {{page}} of {{total}}',

        // Validation
        nameRequired: 'Name is required',
        nameMinLength: 'Name must be at least 2 characters',
    },
    pt: {
        // Page headers
        title: 'Gestão de Marcas',
        subtitle: 'Gerencie as marcas de produtos disponíveis no catálogo',

        // Actions
        createBrand: 'Criar Marca',
        editBrand: 'Editar Marca',
        deleteBrand: 'Excluir Marca',
        saveBrand: 'Salvar Marca',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar marcas...',

        // Table headers
        tableLogo: 'Logo',
        tableName: 'Nome',
        tableSlug: 'Slug',
        tableProducts: 'Produtos',
        tableStatus: 'Status',
        tableActions: 'Ações',

        // Status
        statusActive: 'Ativa',
        statusInactive: 'Inativa',

        // Form fields
        name: 'Nome',
        namePlaceholder: 'Ex: Samsung, Nike, Apple...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Gerado automaticamente',
        description: 'Descrição',
        descriptionPlaceholder: 'Descrição opcional da marca...',
        logo: 'Logo',
        uploadLogo: 'Enviar Logo',
        active: 'Marca Ativa',

        // Messages
        loading: 'Carregando marcas...',
        noBrands: 'Nenhuma marca registrada',
        createSuccess: 'Marca criada com sucesso',
        updateSuccess: 'Marca atualizada com sucesso',
        deleteSuccess: 'Marca excluída com sucesso',
        deleteConfirm: 'Tem certeza que deseja excluir esta marca?',
        deleteWarning: 'Esta ação não pode ser desfeita',

        // Pagination
        previous: 'Anterior',
        next: 'Próximo',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'O nome é obrigatório',
        nameMinLength: 'O nome deve ter pelo menos 2 caracteres',
    },
};
