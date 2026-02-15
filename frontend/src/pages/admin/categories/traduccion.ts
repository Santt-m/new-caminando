import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionCategories: ITranslation = {
    es: {
        // Page headers
        title: 'Gestión de Categorías',
        subtitle: 'Organiza los productos en categorías y subcategorías',

        // Actions
        createCategory: 'Crear Categoría',
        createSubcategory: 'Crear Subcategoría',
        editCategory: 'Editar Categoría',
        deleteCategory: 'Eliminar Categoría',
        saveCategory: 'Guardar Categoría',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar categorías...',

        // Table headers
        tableName: 'Nombre',
        tableSlug: 'Slug',
        tableProducts: 'Productos',
        tableSubcategories: 'Subcategorías',
        tableStatus: 'Estado',
        tableActions: 'Acciones',

        // Status
        statusActive: 'Activa',
        statusInactive: 'Inactiva',

        // Form fields
        name: 'Nombre',
        namePlaceholder: 'Ej: Electrónica, Ropa, Alimentos...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Se genera automáticamente',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción opcional de la categoría...',
        image: 'Imagen',
        uploadImage: 'Subir Imagen',
        parentCategory: 'Categoría Padre',
        parentCategoryPlaceholder: 'Ninguna (categoría raíz)',
        parentCategoryHelper: 'Deja vacío para crear una categoría principal',
        order: 'Orden',
        orderPlaceholder: '0',
        orderHelper: 'Orden de visualización (menor = primero)',
        active: 'Categoría Activa',

        // Messages
        loading: 'Cargando categorías...',
        noCategories: 'No hay categorías creadas',
        createSuccess: 'Categoría creada exitosamente',
        updateSuccess: 'Categoría actualizada exitosamente',
        deleteSuccess: 'Categoría eliminada exitosamente',
        deleteConfirm: '¿Estás seguro de eliminar esta categoría?',
        deleteWarning: 'Esta acción también eliminará todas sus subcategorías',

        // Pagination
        previous: 'Anterior',
        next: 'Siguiente',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'El nombre es requerido',
        nameMinLength: 'El nombre debe tener al menos 2 caracteres',

        // Tree view
        expand: 'Expandir',
        collapse: 'Colapsar',
        noSubcategories: 'Sin subcategorías',
    },
    en: {
        // Page headers
        title: 'Category Management',
        subtitle: 'Organize products into categories and subcategories',

        // Actions
        createCategory: 'Create Category',
        createSubcategory: 'Create Subcategory',
        editCategory: 'Edit Category',
        deleteCategory: 'Delete Category',
        saveCategory: 'Save Category',
        cancel: 'Cancel',

        // Search and filters
        searchPlaceholder: 'Search categories...',

        // Table headers
        tableName: 'Name',
        tableSlug: 'Slug',
        tableProducts: 'Products',
        tableSubcategories: 'Subcategories',
        tableStatus: 'Status',
        tableActions: 'Actions',

        // Status
        statusActive: 'Active',
        statusInactive: 'Inactive',

        // Form fields
        name: 'Name',
        namePlaceholder: 'E.g: Electronics, Clothing, Food...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Auto-generated',
        description: 'Description',
        descriptionPlaceholder: 'Optional category description...',
        image: 'Image',
        uploadImage: 'Upload Image',
        parentCategory: 'Parent Category',
        parentCategoryPlaceholder: 'None (root category)',
        parentCategoryHelper: 'Leave empty to create a main category',
        order: 'Order',
        orderPlaceholder: '0',
        orderHelper: 'Display order (lower = first)',
        active: 'Active Category',

        // Messages
        loading: 'Loading categories...',
        noCategories: 'No categories created',
        createSuccess: 'Category created successfully',
        updateSuccess: 'Category updated successfully',
        deleteSuccess: 'Category deleted successfully',
        deleteConfirm: 'Are you sure you want to delete this category?',
        deleteWarning: 'This will also delete all its subcategories',

        // Pagination
        previous: 'Previous',
        next: 'Next',
        pageInfo: 'Page {{page}} of {{total}}',

        // Validation
        nameRequired: 'Name is required',
        nameMinLength: 'Name must be at least 2 characters',

        // Tree view
        expand: 'Expand',
        collapse: 'Collapse',
        noSubcategories: 'No subcategories',
    },
    pt: {
        // Page headers
        title: 'Gestão de Categorias',
        subtitle: 'Organize produtos em categorias e subcategorias',

        // Actions
        createCategory: 'Criar Categoria',
        createSubcategory: 'Criar Subcategoria',
        editCategory: 'Editar Categoria',
        deleteCategory: 'Excluir Categoria',
        saveCategory: 'Salvar Categoria',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar categorias...',

        // Table headers
        tableName: 'Nome',
        tableSlug: 'Slug',
        tableProducts: 'Produtos',
        tableSubcategories: 'Subcategorias',
        tableStatus: 'Status',
        tableActions: 'Ações',

        // Status
        statusActive: 'Ativa',
        statusInactive: 'Inativa',

        // Form fields
        name: 'Nome',
        namePlaceholder: 'Ex: Eletrônicos, Roupas, Alimentos...',
        slug: 'Slug (URL)',
        slugPlaceholder: 'Gerado automaticamente',
        description: 'Descrição',
        descriptionPlaceholder: 'Descrição opcional da categoria...',
        image: 'Imagem',
        uploadImage: 'Enviar Imagem',
        parentCategory: 'Categoria Pai',
        parentCategoryPlaceholder: 'Nenhuma (categoria raiz)',
        parentCategoryHelper: 'Deixe vazio para criar uma categoria principal',
        order: 'Ordem',
        orderPlaceholder: '0',
        orderHelper: 'Ordem de exibição (menor = primeiro)',
        active: 'Categoria Ativa',

        // Messages
        loading: 'Carregando categorias...',
        noCategories: 'Nenhuma categoria criada',
        createSuccess: 'Categoria criada com sucesso',
        updateSuccess: 'Categoria atualizada com sucesso',
        deleteSuccess: 'Categoria excluída com sucesso',
        deleteConfirm: 'Tem certeza que deseja excluir esta categoria?',
        deleteWarning: 'Isso também excluirá todas as suas subcategorias',

        // Pagination
        previous: 'Anterior',
        next: 'Próximo',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'O nome é obrigatório',
        nameMinLength: 'O nome deve ter pelo menos 2 caracteres',

        // Tree view
        expand: 'Expandir',
        collapse: 'Recolher',
        noSubcategories: 'Sem subcategorias',
    },
};
