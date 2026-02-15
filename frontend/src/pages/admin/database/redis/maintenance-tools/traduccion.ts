export interface ITranslation {
    es: Record<string, string>;
    en: Record<string, string>;
    pt: Record<string, string>;
    [key: string]: Record<string, string>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Herramientas de Mantenimiento",
        subtitle: "Operaciones peligrosas - usar con precaución",
        buttonBack: "Volver",
        sectionBgsave: "Guardado en Segundo Plano (BGSAVE)",
        bgsaveDescription: "Activa un guardado en segundo plano de la base de datos Redis en disco. Esto crea una instantánea de los datos actuales sin bloquear el servidor.",
        buttonBgsave: "Activar BGSAVE",
        sectionFlush: "Vaciar Base de Datos (FLUSHDB)",
        flushWarning: "ZONA DE PELIGRO",
        flushDescription: "Esto ELIMINARÁ TODAS LAS KEYS en la base de datos Redis actual. Esta acción no se puede deshacer.",
        flushConfirmLabel: "Escribe CONFIRM para vaciar la base de datos",
        flushConfirmPlaceholder: "Escribe CONFIRM",
        buttonFlush: "Vaciar Base de Datos",
        dangerZone: "⚠️ ZONA DE PELIGRO",
        warningDestructive: "Esto ELIMINARÁ TODAS LAS KEYS en la base de datos Redis actual. Esta acción no se puede deshacer.",
        successBgsave: "BGSAVE activado exitosamente",
        successFlush: "Base de datos vaciada exitosamente",
        errorConfirm: "Por favor escribe CONFIRM para vaciar la base de datos"
    },
    en: {
        title: "Maintenance Tools",
        subtitle: "Dangerous operations - use with caution",
        buttonBack: "Back",
        sectionBgsave: "Background Save (BGSAVE)",
        bgsaveDescription: "Trigger a background save of the Redis database to disk. This creates a snapshot of the current data without blocking the server.",
        buttonBgsave: "Trigger BGSAVE",
        sectionFlush: "Flush Database (FLUSHDB)",
        flushWarning: "DANGER ZONE",
        flushDescription: "This will DELETE ALL KEYS in the current Redis database. This action cannot be undone.",
        flushConfirmLabel: "Type CONFIRM to flush the database",
        flushConfirmPlaceholder: "Type CONFIRM",
        buttonFlush: "Flush Database",
        dangerZone: "⚠️ DANGER ZONE",
        warningDestructive: "This will DELETE ALL KEYS in the current Redis database. This action cannot be undone.",
        successBgsave: "BGSAVE triggered successfully",
        successFlush: "Database flushed successfully",
        errorConfirm: "Please type CONFIRM to flush the database"
    },
    pt: {
        title: "Ferramentas de Manutenção",
        subtitle: "Operações perigosas - use com cuidado",
        buttonBack: "Voltar",
        sectionBgsave: "Salvamento em Segundo Plano (BGSAVE)",
        bgsaveDescription: "Aciona um salvamento em segundo plano do banco de dados Redis no disco. Isso cria um snapshot dos dados atuais sem bloquear o servidor.",
        buttonBgsave: "Acionar BGSAVE",
        sectionFlush: "Limpar Banco de Dados (FLUSHDB)",
        flushWarning: "ZONA DE PERIGO",
        flushDescription: "Isso EXCLUIRÁ TODAS AS CHAVES no banco de dados Redis atual. Esta ação não pode ser desfeita.",
        flushConfirmLabel: "Digite CONFIRM para limpar o banco de dados",
        flushConfirmPlaceholder: "Digite CONFIRM",
        buttonFlush: "Limpar Banco de Dados",
        dangerZone: "⚠️ ZONA DE PERIGO",
        warningDestructive: "Isso EXCLUIRÁ TODAS AS CHAVES no banco de dados Redis atual. Esta ação não pode ser desfeita.",
        successBgsave: "BGSAVE acionado com sucesso",
        successFlush: "Banco de dados limpo com sucesso",
        errorConfirm: "Por favor digite CONFIRM para limpar o banco de dados"
    }
};
