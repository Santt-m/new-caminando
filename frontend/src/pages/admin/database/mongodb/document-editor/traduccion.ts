export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        titleNew: "Nuevo Documento",
        titleEdit: "Editar Documento",
        subtitle: "Editor JSON",
        buttonSave: "Guardar",
        buttonBack: "Volver",
        editorLabel: "Contenido JSON",
        editorPlaceholder: "Edita el documento JSON aquí...",
        editorHelp: "Asegúrate de que sea JSON válido antes de guardar.",
        errorInvalidJson: "JSON inválido",
        errorSaveFailed: "Error al guardar el documento",
        loading: "Cargando...",
        successSaved: "Documento guardado exitosamente"
    },
    en: {
        titleNew: "New Document",
        titleEdit: "Edit Document",
        subtitle: "JSON Editor",
        buttonSave: "Save",
        buttonBack: "Back",
        editorLabel: "JSON Content",
        editorPlaceholder: "Edit the JSON document here...",
        editorHelp: "Make sure it's valid JSON before saving.",
        errorInvalidJson: "Invalid JSON",
        errorSaveFailed: "Failed to save document",
        loading: "Loading...",
        successSaved: "Document saved successfully"
    },
    pt: {
        titleNew: "Novo Documento",
        titleEdit: "Editar Documento",
        subtitle: "Editor JSON",
        buttonSave: "Salvar",
        buttonBack: "Voltar",
        editorLabel: "Conteúdo JSON",
        editorPlaceholder: "Edite o documento JSON aqui...",
        editorHelp: "Certifique-se de que seja JSON válido antes de salvar.",
        errorInvalidJson: "JSON inválido",
        errorSaveFailed: "Falha ao salvar documento",
        loading: "Carregando...",
        successSaved: "Documento salvo com sucesso"
    }
};
