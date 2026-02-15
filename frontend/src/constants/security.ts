// Traducciones de estados de visitante
export const VISITOR_STATE_LABELS: Record<string, { es: string; en: string; pt: string; description: string }> = {
    NORMAL: {
        es: 'Normal',
        en: 'Normal',
        pt: 'Normal',
        description: 'Usuario legítimo con comportamiento estándar'
    },
    BOT: {
        es: 'Bot',
        en: 'Bot',
        pt: 'Bot',
        description: 'Bot automatizado detectado (puede ser legítimo)'
    },
    SCRAPER: {
        es: 'Scraper',
        en: 'Scraper',
        pt: 'Scraper',
        description: 'Bot intentando extraer datos del sitio'
    },
    SUSPICIOUS: {
        es: 'Sospechoso',
        en: 'Suspicious',
        pt: 'Suspeito',
        description: 'Comportamiento anómalo detectado'
    },
    MALICIOUS: {
        es: 'Malicioso',
        en: 'Malicious',
        pt: 'Malicioso',
        description: 'Amenaza confirmada, tráfico bloqueado'
    },
    IP_BLOCKED: {
        es: 'IP Bloqueada',
        en: 'IP Blocked',
        pt: 'IP Bloqueado',
        description: 'IP en lista negra, acceso denegado'
    }
};

// Traducciones de tipos de eventos
export const EVENT_TYPE_LABELS: Record<string, { es: string; en: string; pt: string; icon?: string }> = {
    LOGIN_SUCCESS: { es: 'Inicio de Sesión Exitoso', en: 'Login Success', pt: 'Login Bem-sucedido' },
    LOGIN_FAILED: { es: 'Intento de Login Fallido', en: 'Failed Login Attempt', pt: 'Tentativa de Login Falhada' },
    LOGOUT: { es: 'Cierre de Sesión', en: 'Logout', pt: 'Logout' },
    REGISTER_SUCCESS: { es: 'Cuenta Creada', en: 'Account Created', pt: 'Conta Criada' },
    PAGE_VIEW: { es: 'Vista de Página', en: 'Page View', pt: 'Visualização de Página' },
    SEARCH: { es: 'Búsqueda', en: 'Search', pt: 'Pesquisa' },
    FILTER_CHANGE: { es: 'Filtros Aplicados', en: 'Filters Applied', pt: 'Filtros Aplicados' },
    API_ERROR: { es: 'Error de Sistema', en: 'System Error', pt: 'Erro do Sistema' },
    SUSPICIOUS_ACTION: { es: 'Acción Sospechosa', en: 'Suspicious Action', pt: 'Ação Suspeita' },
    RATE_LIMIT_EXCEEDED: { es: 'Límite de Tasa Excedido', en: 'Rate Limit Exceeded', pt: 'Limite de Taxa Excedido' },
    UNAUTHORIZED_ACCESS: { es: 'Acceso No Autorizado', en: 'Unauthorized Access', pt: 'Acesso Não Autorizado' }
};

// Colores por estado
export const STATE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
    NORMAL: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-500' },
    BOT: { bg: 'bg-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-500' },
    SCRAPER: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-500' },
    SUSPICIOUS: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-500' },
    MALICIOUS: { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-500' },
    IP_BLOCKED: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-600' }
};

// Helper para obtener label traducido
export const getVisitorStateLabel = (state: string, lang: 'es' | 'en' | 'pt' = 'es') => {
    return VISITOR_STATE_LABELS[state]?.[lang] || state;
};

export const getEventTypeLabel = (eventType: string, lang: 'es' | 'en' | 'pt' = 'es') => {
    return EVENT_TYPE_LABELS[eventType]?.[lang] || eventType.replace(/_/g, ' ');
};

export const getStateDescription = (state: string) => {
    return VISITOR_STATE_LABELS[state]?.description || 'Sin descripción';
};

export const getStateColor = (state: string) => {
    return STATE_COLORS[state] || { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-500' };
};

// Nivel de riesgo basado en score
export const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Crítico', color: 'text-red-600' };
    if (score >= 60) return { label: 'Alto', color: 'text-orange-600' };
    if (score >= 40) return { label: 'Medio', color: 'text-amber-600' };
    if (score >= 20) return { label: 'Bajo', color: 'text-yellow-600' };
    return { label: 'Mínimo', color: 'text-green-600' };
};
