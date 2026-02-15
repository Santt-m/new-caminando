import type { ITranslation } from '@/hooks/useLanguage';

export const traduccionTickets: ITranslation = {
    es: {
        title: 'Soporte',
        subtitle: 'Gestiona los tickets y consultas de usuarios.',

        // Filtros
        statusLabel: 'Estado:',
        priorityLabel: 'Prioridad:',
        allStatuses: 'Todos',
        allPriorities: 'Todas',

        // Estados
        statusOpen: 'Abierto',
        statusInProgress: 'En Progreso',
        statusResolved: 'Resuelto',
        statusClosed: 'Cerrado',

        // Prioridades
        priorityCritical: 'Crítica',
        priorityHigh: 'Alta',
        priorityMedium: 'Media',
        priorityLow: 'Baja',

        // Tabla
        colPriority: 'Prio',
        colSubject: 'Asunto',
        colUser: 'Usuario',
        colStatus: 'Estado',
        colLastUpdate: 'Última Act.',
        colAction: 'Acción',

        // Acciones
        btnView: 'Ver',
        btnReply: 'Responder',
        btnSendReply: 'Enviar Respuesta',
        btnCloseTicket: 'Cerrar Ticket',
        btnTakeTicket: 'Tomar Ticket',

        // Detalle
        ticketNotFound: 'Ticket no encontrado',
        replyLabel: 'Responder',
        replyPlaceholder: 'Escribe tu respuesta aquí...',
        ticketClosedMessage: 'Este ticket está cerrado y no admite más respuestas.',
        userInfoTitle: 'Información del Usuario',
        ticketDetailsTitle: 'Detalles del Ticket',

        // Campos
        createdLabel: 'Creado',
        nameLabel: 'Nombre',
        emailLabel: 'Email',
        agentName: 'Agente de Soporte',
        userDefaultName: 'Usuario',

        // Toasts
        successReply: 'Respuesta enviada',
        errorReply: 'Error al enviar respuesta',
        successStatus: 'Estado actualizado',
        errorStatus: 'Error al actualizar estado',

        // Empty states
        noTickets: 'No se encontraron tickets',
    },
    en: {
        title: 'Support',
        subtitle: 'Manage user tickets and inquiries.',

        statusLabel: 'Status:',
        priorityLabel: 'Priority:',
        allStatuses: 'All',
        allPriorities: 'All',

        statusOpen: 'Open',
        statusInProgress: 'In Progress',
        statusResolved: 'Resolved',
        statusClosed: 'Closed',

        priorityCritical: 'Critical',
        priorityHigh: 'High',
        priorityMedium: 'Medium',
        priorityLow: 'Low',

        colPriority: 'Prio',
        colSubject: 'Subject',
        colUser: 'User',
        colStatus: 'Status',
        colLastUpdate: 'Last Upd.',
        colAction: 'Action',

        btnView: 'View',
        btnReply: 'Reply',
        btnSendReply: 'Send Reply',
        btnCloseTicket: 'Close Ticket',
        btnTakeTicket: 'Take Ticket',

        ticketNotFound: 'Ticket not found',
        replyLabel: 'Reply',
        replyPlaceholder: 'Write your reply here...',
        ticketClosedMessage: 'This ticket is closed and does not accept further replies.',
        userInfoTitle: 'User Information',
        ticketDetailsTitle: 'Ticket Details',

        createdLabel: 'Created',
        nameLabel: 'Name',
        emailLabel: 'Email',
        agentName: 'Support Agent',
        userDefaultName: 'User',

        successReply: 'Reply sent',
        errorReply: 'Error sending reply',
        successStatus: 'Status updated',
        errorStatus: 'Error updating status',

        noTickets: 'No tickets found',
    },
    pt: {
        title: 'Suporte',
        subtitle: 'Gerencie tickets e dúvidas dos usuários.',

        statusLabel: 'Estado:',
        priorityLabel: 'Prioridade:',
        allStatuses: 'Todos',
        allPriorities: 'Todas',

        statusOpen: 'Aberto',
        statusInProgress: 'Em Progresso',
        statusResolved: 'Resolvido',
        statusClosed: 'Fechado',

        priorityCritical: 'Crítica',
        priorityHigh: 'Alta',
        priorityMedium: 'Média',
        priorityLow: 'Baixa',

        colPriority: 'Prio',
        colSubject: 'Assunto',
        colUser: 'Usuário',
        colStatus: 'Estado',
        colLastUpdate: 'Última At.',
        colAction: 'Ação',

        btnView: 'Ver',
        btnReply: 'Responder',
        btnSendReply: 'Enviar Resposta',
        btnCloseTicket: 'Fechar Ticket',
        btnTakeTicket: 'Pegar Ticket',

        ticketNotFound: 'Ticket não encontrado',
        replyLabel: 'Responder',
        replyPlaceholder: 'Escreva sua resposta aqui...',
        ticketClosedMessage: 'Este ticket está fechado e não aceita mais respostas.',
        userInfoTitle: 'Informações do Usuário',
        ticketDetailsTitle: 'Detalhes do Ticket',

        createdLabel: 'Criado',
        nameLabel: 'Nome',
        emailLabel: 'Email',
        agentName: 'Agente de Suporte',
        userDefaultName: 'Usuário',

        successReply: 'Resposta enviada',
        errorReply: 'Erro ao enviar resposta',
        successStatus: 'Status atualizado',
        errorStatus: 'Erro ao atualizar status',

        noTickets: 'Nenhum ticket encontrado',
    }
};
