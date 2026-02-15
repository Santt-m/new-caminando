export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Inspector de Redis",
        subtitle: "Monitoreo y gestión en tiempo real",
        buttonKeyExplorer: "Explorador de Keys",
        buttonTools: "Herramientas",
        metricMemory: "Memoria Total",
        metricHitRate: "Tasa de Aciertos",
        metricEvicted: "Keys Evicted",
        metricExpired: "Keys Expired",
        sectionMemoryByPattern: "Uso de Memoria por Patrón",
        sectionSlowLog: "Comandos Lentos Recientes",
        tableHeaderPattern: "Patrón",
        tableHeaderKeys: "keys",
        tableHeaderMemory: "Memoria",
        tableHeaderTTL: "TTL",
        tableHeaderCommand: "Comando",
        tableHeaderDuration: "Duración",
        loading: "Cargando..."
    },
    en: {
        title: "Redis Inspector",
        subtitle: "Real-time monitoring and management",
        buttonKeyExplorer: "Key Explorer",
        buttonTools: "Tools",
        metricMemory: "Total Memory",
        metricHitRate: "Hit Rate",
        metricEvicted: "Evicted Keys",
        metricExpired: "Expired Keys",
        sectionMemoryByPattern: "Memory Usage by Pattern",
        sectionSlowLog: "Recent Slow Commands",
        tableHeaderPattern: "Pattern",
        tableHeaderKeys: "keys",
        tableHeaderMemory: "Memory",
        tableHeaderTTL: "TTL",
        tableHeaderCommand: "Command",
        tableHeaderDuration: "Duration",
        loading: "Loading..."
    },
    pt: {
        title: "Inspetor Redis",
        subtitle: "Monitoramento e gerenciamento em tempo real",
        buttonKeyExplorer: "Explorador de Chaves",
        buttonTools: "Ferramentas",
        metricMemory: "Memória Total",
        metricHitRate: "Taxa de Acertos",
        metricEvicted: "Chaves Evicted",
        metricExpired: "Chaves Expiradas",
        sectionMemoryByPattern: "Uso de Memória por Padrão",
        sectionSlowLog: "Comandos Lentos Recentes",
        tableHeaderPattern: "Padrão",
        tableHeaderKeys: "chaves",
        tableHeaderMemory: "Memória",
        tableHeaderTTL: "TTL",
        tableHeaderCommand: "Comando",
        tableHeaderDuration: "Duração",
        loading: "Carregando..."
    }
};
