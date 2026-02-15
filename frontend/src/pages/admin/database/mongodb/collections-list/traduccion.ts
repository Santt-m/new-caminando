export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Explorador de MongoDB",
        subtitle: "colecciones",
        subtitleDocuments: "documentos",
        searchPlaceholder: "Buscar colecciones...",
        buttonView: "Ver",
        buttonDelete: "Eliminar",
        deleteModalTitle: "Eliminar Colección",
        deleteModalDescription: "Estás a punto de eliminar la colección {name}. Todos los documentos e índices se perderán para siempre.",
        deleteConfirmLabel: "Escribe el nombre de la colección para confirmar:",
        deletePlaceholder: "Nombre de la colección...",
        loading: "Cargando...",
        successDelete: "Colección eliminada correctamente"
    },
    en: {
        title: "MongoDB Browser",
        subtitle: "collections",
        subtitleDocuments: "documents",
        searchPlaceholder: "Search collections...",
        buttonView: "View",
        buttonDelete: "Delete",
        deleteModalTitle: "Delete Collection",
        deleteModalDescription: "You are about to delete the collection {name}. All documents and indexes will be lost forever.",
        deleteConfirmLabel: "Type the collection name to confirm:",
        deletePlaceholder: "Collection name...",
        loading: "Loading...",
        successDelete: "Collection deleted successfully"
    },
    pt: {
        title: "Navegador MongoDB",
        subtitle: "coleções",
        subtitleDocuments: "documentos",
        searchPlaceholder: "Pesquisar coleções...",
        buttonView: "Ver",
        buttonDelete: "Excluir",
        deleteModalTitle: "Excluir Coleção",
        deleteModalDescription: "Você está prestes a excluir a coleção {name}. Todos os documentos e índices serão perdidos para sempre.",
        deleteConfirmLabel: "Digite o nome da coleção para confirmar:",
        deletePlaceholder: "Nome da coleção...",
        loading: "Carregando...",
        successDelete: "Coleção excluída com sucesso"
    }
};
