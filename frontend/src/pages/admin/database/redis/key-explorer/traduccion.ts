export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Explorador de Keys",
        subtitle: "keys totales",
        searchPlaceholder: "Patrón (ej: cache:*, session:user:*)",
        buttonBack: "Volver",
        sectionKeys: "Keys",
        sectionDetails: "Detalles de la Key",
        labelKey: "Key",
        labelType: "Tipo",
        labelTTL: "TTL",
        labelValue: "Valor",
        buttonDelete: "Eliminar Key",
        confirmDelete: "¿Eliminar key",
        selectKeyPrompt: "Selecciona una key para ver detalles",
        loading: "Cargando...",
        noKeys: "No se encontraron keys",
        ttlNoExpiration: "Sin expiración",
        ttlNotExists: "La key no existe",
        ttlSeconds: "segundos"
    },
    en: {
        title: "Key Explorer",
        subtitle: "total keys",
        searchPlaceholder: "Pattern (e.g., cache:*, session:user:*)",
        buttonBack: "Back",
        sectionKeys: "Keys",
        sectionDetails: "Key Details",
        labelKey: "Key",
        labelType: "Type",
        labelTTL: "TTL",
        labelValue: "Value",
        buttonDelete: "Delete Key",
        confirmDelete: "Delete key",
        selectKeyPrompt: "Select a key to view details",
        loading: "Loading...",
        noKeys: "No keys found",
        ttlNoExpiration: "No expiration",
        ttlNotExists: "Key does not exist",
        ttlSeconds: "seconds"
    },
    pt: {
        title: "Explorador de Chaves",
        subtitle: "chaves totais",
        searchPlaceholder: "Padrão (ex: cache:*, session:user:*)",
        buttonBack: "Voltar",
        sectionKeys: "Chaves",
        sectionDetails: "Detalhes da Chave",
        labelKey: "Chave",
        labelType: "Tipo",
        labelTTL: "TTL",
        labelValue: "Valor",
        buttonDelete: "Excluir Chave",
        confirmDelete: "Excluir chave",
        selectKeyPrompt: "Selecione uma chave para ver detalhes",
        loading: "Carregando...",
        noKeys: "Nenhuma chave encontrada",
        ttlNoExpiration: "Sem expiração",
        ttlNotExists: "A chave não existe",
        ttlSeconds: "segundos"
    }
};
