import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionAttributes: ITranslation = {
    es: {
        // Page headers
        title: 'Gestión de Atributos',
        subtitle: 'Define los atributos personalizables para las variantes de productos',

        // Actions
        createAttribute: 'Crear Atributo',
        editAttribute: 'Editar Atributo',
        deleteAttribute: 'Eliminar Atributo',
        saveAttribute: 'Guardar Atributo',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar atributos...',

        // Table headers
        tableName: 'Nombre',
        tableKey: 'Clave',
        tableType: 'Tipo',
        tableValues: 'Valores',
        tableStatus: 'Estado',
        tableActions: 'Acciones',

        // Status
        statusActive: 'Activo',
        statusInactive: 'Inactivo',

        // Attribute types
        typeSelect: 'Selección',
        typeText: 'Texto',
        typeNumber: 'Número',

        // Form fields
        name: 'Nombre',
        namePlaceholder: 'Ej: Color, Talla, Memoria...',
        key: 'Clave (Identificador)',
        keyPlaceholder: 'Ej: color, size, ram',
        keyHelper: 'Se usa internamente, debe ser único y sin espacios',
        type: 'Tipo de Atributo',
        typeHelper: 'Define cómo se ingresará el valor',
        values: 'Valores Disponibles',
        valuesPlaceholder: 'Ej: Rojo, Azul, Verde (separados por Enter)',
        valuesHelper: 'Presiona Enter después de cada valor',
        unit: 'Unidad',
        unitPlaceholder: 'Ej: GB, kg, cm',
        unitHelper: 'Para atributos numéricos',
        active: 'Atributo Activo',
        addValue: 'Agregar Valor',

        // Messages
        loading: 'Cargando atributos...',
        noAttributes: 'No hay atributos definidos',
        createSuccess: 'Atributo creado exitosamente',
        updateSuccess: 'Atributo actualizado exitosamente',
        deleteSuccess: 'Atributo eliminado exitosamente',
        deleteConfirm: '¿Estás seguro de eliminar este atributo?',
        deleteWarning: 'Esta acción no se puede deshacer',

        // Pagination
        previous: 'Anterior',
        next: 'Siguiente',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'El nombre es requerido',
        keyRequired: 'La clave es requerida',
        keyInvalid: 'La clave solo puede contener letras, números y guiones bajos',
        typeRequired: 'Debes seleccionar un tipo',
        valuesRequired: 'Debes agregar al menos un valor para tipo selección',
    },
    en: {
        // Page headers
        title: 'Attribute Management',
        subtitle: 'Define customizable attributes for product variants',

        // Actions
        createAttribute: 'Create Attribute',
        editAttribute: 'Edit Attribute',
        deleteAttribute: 'Delete Attribute',
        saveAttribute: 'Save Attribute',
        cancel: 'Cancel',

        // Search and filters
        searchPlaceholder: 'Search attributes...',

        // Table headers
        tableName: 'Name',
        tableKey: 'Key',
        tableType: 'Type',
        tableValues: 'Values',
        tableStatus: 'Status',
        tableActions: 'Actions',

        // Status
        statusActive: 'Active',
        statusInactive: 'Inactive',

        // Attribute types
        typeSelect: 'Selection',
        typeText: 'Text',
        typeNumber: 'Number',

        // Form fields
        name: 'Name',
        namePlaceholder: 'E.g: Color, Size, Memory...',
        key: 'Key (Identifier)',
        keyPlaceholder: 'E.g: color, size, ram',
        keyHelper: 'Used internally, must be unique and without spaces',
        type: 'Attribute Type',
        typeHelper: 'Defines how the value will be entered',
        values: 'Available Values',
        valuesPlaceholder: 'E.g: Red, Blue, Green (separated by Enter)',
        valuesHelper: 'Press Enter after each value',
        unit: 'Unit',
        unitPlaceholder: 'E.g: GB, kg, cm',
        unitHelper: 'For numeric attributes',
        active: 'Active Attribute',
        addValue: 'Add Value',

        // Messages
        loading: 'Loading attributes...',
        noAttributes: 'No attributes defined',
        createSuccess: 'Attribute created successfully',
        updateSuccess: 'Attribute updated successfully',
        deleteSuccess: 'Attribute deleted successfully',
        deleteConfirm: 'Are you sure you want to delete this attribute?',
        deleteWarning: 'This action cannot be undone',

        // Pagination
        previous: 'Previous',
        next: 'Next',
        pageInfo: 'Page {{page}} of {{total}}',

        // Validation
        nameRequired: 'Name is required',
        keyRequired: 'Key is required',
        keyInvalid: 'Key can only contain letters, numbers and underscores',
        typeRequired: 'You must select a type',
        valuesRequired: 'You must add at least one value for selection type',
    },
    pt: {
        // Page headers
        title: 'Gestão de Atributos',
        subtitle: 'Defina atributos personalizáveis para variantes de produtos',

        // Actions
        createAttribute: 'Criar Atributo',
        editAttribute: 'Editar Atributo',
        deleteAttribute: 'Excluir Atributo',
        saveAttribute: 'Salvar Atributo',
        cancel: 'Cancelar',

        // Search and filters
        searchPlaceholder: 'Buscar atributos...',

        // Table headers
        tableName: 'Nome',
        tableKey: 'Chave',
        tableType: 'Tipo',
        tableValues: 'Valores',
        tableStatus: 'Status',
        tableActions: 'Ações',

        // Status
        statusActive: 'Ativo',
        statusInactive: 'Inativo',

        // Attribute types
        typeSelect: 'Seleção',
        typeText: 'Texto',
        typeNumber: 'Número',

        // Form fields
        name: 'Nome',
        namePlaceholder: 'Ex: Cor, Tamanho, Memória...',
        key: 'Chave (Identificador)',
        keyPlaceholder: 'Ex: color, size, ram',
        keyHelper: 'Usado internamente, deve ser único e sem espaços',
        type: 'Tipo de Atributo',
        typeHelper: 'Define como o valor será inserido',
        values: 'Valores Disponíveis',
        valuesPlaceholder: 'Ex: Vermelho, Azul, Verde (separados por Enter)',
        valuesHelper: 'Pressione Enter após cada valor',
        unit: 'Unidade',
        unitPlaceholder: 'Ex: GB, kg, cm',
        unitHelper: 'Para atributos numéricos',
        active: 'Atributo Ativo',
        addValue: 'Adicionar Valor',

        // Messages
        loading: 'Carregando atributos...',
        noAttributes: 'Nenhum atributo definido',
        createSuccess: 'Atributo criado com sucesso',
        updateSuccess: 'Atributo atualizado com sucesso',
        deleteSuccess: 'Atributo excluído com sucesso',
        deleteConfirm: 'Tem certeza que deseja excluir este atributo?',
        deleteWarning: 'Esta ação não pode ser desfeita',

        // Pagination
        previous: 'Anterior',
        next: 'Próximo',
        pageInfo: 'Página {{page}} de {{total}}',

        // Validation
        nameRequired: 'O nome é obrigatório',
        keyRequired: 'A chave é obrigatória',
        keyInvalid: 'A chave só pode conter letras, números e sublinhados',
        typeRequired: 'Você deve selecionar um tipo',
        valuesRequired: 'Você deve adicionar pelo menos um valor para tipo seleção',
    },
};
