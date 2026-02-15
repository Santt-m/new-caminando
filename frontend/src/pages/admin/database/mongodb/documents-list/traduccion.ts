export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Documentos",
        subtitle: "documentos",
        searchPlaceholder: "Buscar documentos...",
        buttonIndexes: "Índices",
        buttonNewDocument: "Nuevo Documento",
        buttonEdit: "Editar",
        buttonDelete: "Eliminar",
        deleteModalTitle: "Eliminar Documento",
        deleteModalDescription: "Estás a punto de eliminar este documento de forma permanente. Esta acción no se puede deshacer.",
        deleteConfirmLabel: "Escribe {confirm} para confirmar:",
        deletePlaceholder: "Escriba DELETE...",
        loading: "Cargando...",
        noDocuments: "No hay documentos",
        paginationPage: "Página",
        paginationOf: "de",
        buttonPrevious: "Anterior",
        buttonNext: "Siguiente",
        buttonBack: "Volver"
    },
    en: {
        title: "Documents",
        subtitle: "documents",
        searchPlaceholder: "Search documents...",
        buttonIndexes: "Indexes",
        buttonNewDocument: "New Document",
        buttonEdit: "Edit",
        buttonDelete: "Delete",
        deleteModalTitle: "Delete Document",
        deleteModalDescription: "You are about to delete this document permanently. This action cannot be undone.",
        deleteConfirmLabel: "Type {confirm} to confirm:",
        deletePlaceholder: "Type DELETE...",
        loading: "Loading...",
        noDocuments: "No documents",
        paginationPage: "Page",
        paginationOf: "of",
        buttonPrevious: "Previous",
        buttonNext: "Next",
        buttonBack: "Back"
    },
    pt: {
        title: "Documentos",
        subtitle: "documentos",
        searchPlaceholder: "Pesquisar documentos...",
        buttonIndexes: "Índices",
        buttonNewDocument: "Novo Documento",
        buttonEdit: "Editar",
        buttonDelete: "Excluir",
        confirmDelete: "Tem certeza de que deseja excluir este documento?",
        loading: "Carregando...",
        noDocuments: "Sem documentos",
        paginationPage: "Página",
        paginationOf: "de",
        buttonPrevious: "Anterior",
        buttonNext: "Próximo",
        buttonBack: "Voltar"
    }
};
