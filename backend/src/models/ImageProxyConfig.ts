import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface para la configuración del proxy de imágenes
 */
export interface IImageProxyConfig extends Document {
    // Feature toggles
    trackingEnabled: boolean;
    cacheEnabled: boolean;
    rateLimitEnabled: boolean;
    hotlinkProtectionEnabled: boolean;
    
    // Cache settings
    cacheTTL: number;                    // Tiempo de vida del cache en segundos (default: 3600)
    cacheMaxSize: number;                // Tamaño máximo en bytes (default: 100MB)
    
    // Rate limiting
    rateLimitPerMinute: number;          // Max requests por IP por minuto (default: 100)
    rateLimitPerHour: number;            // Max requests por IP por hora (default: 1000)
    rateLimitPerDay: number;             // Max requests por IP por día (default: 10000)
    
    // Hotlink protection
    allowedDomains: string[];            // Dominios permitidos (referer)
    allowEmptyReferer: boolean;          // Permitir requests sin referer
    
    // IP management
    blacklistedIPs: string[];            // IPs bloqueadas
    whitelistedIPs: string[];            // IPs siempre permitidas (bypass rate limit)
    autoBlockThreshold: number;          // Requests/min para auto-bloqueo (default: 200)
    autoBlockEnabled: boolean;           // Auto-bloquear IPs sospechosas
    
    // Alerts
    alertsEnabled: boolean;
    alertEmail?: string;                 // Email para alertas
    alertWebhook?: string;               // Webhook URL para alertas
    alertThresholdRequests: number;      // Umbral de requests para alerta (default: 500/hora)
    alertThresholdUniqueIPs: number;     // Umbral de IPs únicas (default: 100/hora)
    
    // Analytics
    retentionDays: number;               // Días de retención de eventos (default: 30)
    
    // Sistema
    isActive: boolean;                   // Si está activo el sistema de proxy
    
    createdAt: Date;
    updatedAt: Date;
    
    // Métodos
    isIPBlocked(ip: string): boolean;
    isRefererAllowed(referer?: string): boolean;
    blockIP(ip: string, reason?: string): Promise<void>;
    unblockIP(ip: string): Promise<void>;
}

const imageProxyConfigSchema = new Schema<IImageProxyConfig>({
    // Feature toggles
    trackingEnabled: {
        type: Boolean,
        default: true
    },
    cacheEnabled: {
        type: Boolean,
        default: true
    },
    rateLimitEnabled: {
        type: Boolean,
        default: true
    },
    hotlinkProtectionEnabled: {
        type: Boolean,
        default: false
    },
    
    // Cache settings
    cacheTTL: {
        type: Number,
        default: 3600,  // 1 hora
        min: 60,
        max: 86400      // 24 horas
    },
    cacheMaxSize: {
        type: Number,
        default: 104857600  // 100MB
    },
    
    // Rate limiting
    rateLimitPerMinute: {
        type: Number,
        default: 100,
        min: 1
    },
    rateLimitPerHour: {
        type: Number,
        default: 1000,
        min: 1
    },
    rateLimitPerDay: {
        type: Number,
        default: 10000,
        min: 1
    },
    
    // Hotlink protection
    allowedDomains: {
        type: [String],
        default: []
    },
    allowEmptyReferer: {
        type: Boolean,
        default: true
    },
    
    // IP management
    blacklistedIPs: {
        type: [String],
        default: [],
        index: true
    },
    whitelistedIPs: {
        type: [String],
        default: [],
        index: true
    },
    autoBlockThreshold: {
        type: Number,
        default: 200
    },
    autoBlockEnabled: {
        type: Boolean,
        default: true
    },
    
    // Alerts
    alertsEnabled: {
        type: Boolean,
        default: false
    },
    alertEmail: String,
    alertWebhook: String,
    alertThresholdRequests: {
        type: Number,
        default: 500
    },
    alertThresholdUniqueIPs: {
        type: Number,
        default: 100
    },
    
    // Analytics
    retentionDays: {
        type: Number,
        default: 30,
        min: 1,
        max: 365
    },
    
    // Sistema
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Solo debe haber una configuración global
imageProxyConfigSchema.index({}, { unique: true });

// Método estático para obtener o crear la configuración
imageProxyConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

// Método para verificar si una IP está bloqueada
imageProxyConfigSchema.methods.isIPBlocked = function(ip: string): boolean {
    if (this.whitelistedIPs.includes(ip)) {
        return false;
    }
    return this.blacklistedIPs.includes(ip);
};

// Método para verificar si el referer es válido
imageProxyConfigSchema.methods.isRefererAllowed = function(referer?: string): boolean {
    if (!this.hotlinkProtectionEnabled) {
        return true;
    }
    
    if (!referer) {
        return this.allowEmptyReferer;
    }
    
    if (this.allowedDomains.length === 0) {
        return true;
    }
    
    return this.allowedDomains.some((domain: string) => referer.includes(domain));
};

// Método para agregar IP a blacklist
imageProxyConfigSchema.methods.blockIP = async function(ip: string, _reason?: string) {
    if (!this.blacklistedIPs.includes(ip)) {
        this.blacklistedIPs.push(ip);
        await this.save();
    }
};

// Método para remover IP de blacklist
imageProxyConfigSchema.methods.unblockIP = async function(ip: string) {
    this.blacklistedIPs = this.blacklistedIPs.filter((blockedIP: string) => blockedIP !== ip);
    await this.save();
};

// Interface para los statics
interface IImageProxyConfigModel extends Model<IImageProxyConfig> {
    getConfig(): Promise<IImageProxyConfig>;
}

export const ImageProxyConfig = model<IImageProxyConfig, IImageProxyConfigModel>('ImageProxyConfig', imageProxyConfigSchema);
