import { Schema, model, Document } from 'mongoose';

/**
 * Interface para los eventos de acceso a imágenes
 */
export interface IImageAccessEvent {
    type: 'view' | 'download' | 'transform' | 'upload' | 'proxy';
    timestamp: Date;
    ip: string;
    userAgent?: string;
    referer?: string;
    cacheHit?: boolean;
    responseTime?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Interface para las métricas de imágenes
 */
export interface IImageMetric extends Document {
    publicId: string;         // ID público de Cloudinary
    resourceType: string;     // Tipo de recurso (image, video, etc.)
    format: string;           // Formato de la imagen (jpg, png, etc.)
    folder?: string;          // Carpeta en Cloudinary
    url: string;              // URL de la imagen
    
    // Métricas de uso
    views: number;            // Número de visualizaciones
    downloads: number;        // Número de descargas
    transformations: number;  // Número de transformaciones aplicadas
    proxyRequests: number;    // Requests a través del proxy
    
    // Información de tamaño
    bytes: number;            // Tamaño en bytes
    width: number;            // Ancho original
    height: number;           // Alto original
    
    // Eventos de uso
    events: IImageAccessEvent[];
    
    // Tracking de IPs
    uniqueIPs: string[];      // IPs únicas que accedieron
    suspiciousIPs: string[];  // IPs marcadas como sospechosas
    
    // Cache metrics
    cacheHits: number;        // Requests servidas desde cache
    cacheMisses: number;      // Requests que requirieron fetch
    
    // Rate limiting
    requestsLastHour: number; // Requests en la última hora
    requestsLastDay: number;  // Requests en el último día
    
    // Información de subida
    uploadedBy?: string;      // ID del usuario que subió
    uploadedAt: Date;         // Fecha de subida
    
    // Métricas agregadas
    lastViewedAt?: Date;      // Última visualización
    lastDownloadedAt?: Date;  // Última descarga
    lastAccessedAt?: Date;    // Último acceso de cualquier tipo
    
    // Flags de seguridad
    isBlocked?: boolean;      // Imagen bloqueada por abuso
    blockedReason?: string;   // Razón del bloqueo
    
    createdAt: Date;
    updatedAt: Date;
    
    // Métodos
    recordAccess(type: 'view' | 'download' | 'transform' | 'upload' | 'proxy', data: {
        ip: string;
        userAgent?: string;
        referer?: string;
        cacheHit?: boolean;
        responseTime?: number;
        metadata?: Record<string, unknown>;
    }): Promise<this>;
    recordEvent(type: 'view' | 'download' | 'transform' | 'upload', metadata?: Record<string, unknown>): Promise<this>;
}

const imageMetricSchema = new Schema<IImageMetric>({
    publicId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    resourceType: {
        type: String,
        required: true,
        default: 'image'
    },
    format: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    
    // Métricas
    views: {
        type: Number,
        default: 0,
        index: true
    },
    downloads: {
        type: Number,
        default: 0,
        index: true
    },
    transformations: {
        type: Number,
        default: 0
    },
    proxyRequests: {
        type: Number,
        default: 0,
        index: true
    },
    
    // Información
    bytes: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    
    // Eventos
    events: [{
        type: {
            type: String,
            enum: ['view', 'download', 'transform', 'upload', 'proxy'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ip: {
            type: String,
            required: true
        },
        userAgent: String,
        referer: String,
        cacheHit: Boolean,
        responseTime: Number,
        metadata: {
            type: Schema.Types.Mixed
        }
    }],
    
    // Tracking
    uniqueIPs: {
        type: [String],
        default: [],
        index: true
    },
    suspiciousIPs: {
        type: [String],
        default: []
    },
    
    // Cache metrics
    cacheHits: {
        type: Number,
        default: 0
    },
    cacheMisses: {
        type: Number,
        default: 0
    },
    
    // Rate limiting
    requestsLastHour: {
        type: Number,
        default: 0,
        index: true
    },
    requestsLastDay: {
        type: Number,
        default: 0,
        index: true
    },
    
    // Upload info
    uploadedBy: {
        type: String,
        index: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Last actions
    lastViewedAt: {
        type: Date,
        index: true
    },
    lastDownloadedAt: {
        type: Date
    },
    lastAccessedAt: {
        type: Date,
        index: true
    },
    
    // Security
    isBlocked: {
        type: Boolean,
        default: false,
        index: true
    },
    blockedReason: String
}, {
    timestamps: true
});

// Índices compuestos para consultas comunes
imageMetricSchema.index({ folder: 1, views: -1 });
imageMetricSchema.index({ folder: 1, proxyRequests: -1 });
imageMetricSchema.index({ uploadedAt: -1 });
imageMetricSchema.index({ lastViewedAt: -1 });
imageMetricSchema.index({ lastAccessedAt: -1 });
imageMetricSchema.index({ 'events.timestamp': -1 });
imageMetricSchema.index({ 'events.ip': 1 });
imageMetricSchema.index({ requestsLastHour: -1 });
imageMetricSchema.index({ requestsLastDay: -1 });

// Método para registrar un acceso
imageMetricSchema.methods.recordAccess = function(
    type: 'view' | 'download' | 'transform' | 'upload' | 'proxy',
    data: {
        ip: string;
        userAgent?: string;
        referer?: string;
        cacheHit?: boolean;
        responseTime?: number;
        metadata?: Record<string, unknown>;
    }
) {
    const now = new Date();
    
    // Agregar evento
    this.events.push({
        type,
        timestamp: now,
        ip: data.ip,
        userAgent: data.userAgent,
        referer: data.referer,
        cacheHit: data.cacheHit,
        responseTime: data.responseTime,
        metadata: data.metadata
    });
    
    // Limitar eventos a los últimos 1000 para no saturar
    if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
    }
    
    // Agregar IP única si no existe
    if (!this.uniqueIPs.includes(data.ip)) {
        this.uniqueIPs.push(data.ip);
    }
    
    // Actualizar contadores
    switch (type) {
        case 'view':
            this.views += 1;
            this.lastViewedAt = now;
            break;
        case 'download':
            this.downloads += 1;
            this.lastDownloadedAt = now;
            break;
        case 'transform':
            this.transformations += 1;
            break;
        case 'proxy':
            this.proxyRequests += 1;
            break;
    }
    
    // Actualizar cache stats
    if (data.cacheHit !== undefined) {
        if (data.cacheHit) {
            this.cacheHits += 1;
        } else {
            this.cacheMisses += 1;
        }
    }
    
    this.lastAccessedAt = now;
    this.requestsLastHour += 1;
    this.requestsLastDay += 1;
    
    return this.save();
};

// Método legacy para compatibilidad
imageMetricSchema.methods.recordEvent = function(
    type: 'view' | 'download' | 'transform' | 'upload',
    metadata?: Record<string, unknown>
) {
    return this.recordAccess(type, {
        ip: 'unknown',
        metadata
    });
};

// Método estático para obtener top imágenes
imageMetricSchema.statics.getTopImages = function(limit = 10, type: 'views' | 'downloads' = 'views') {
    const sortField = type === 'views' ? 'views' : 'downloads';
    return this.find()
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('-events');
};

// Método estático para obtener estadísticas por carpeta
imageMetricSchema.statics.getStatsByFolder = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$folder',
                totalImages: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalDownloads: { $sum: '$downloads' },
                totalBytes: { $sum: '$bytes' },
                avgViews: { $avg: '$views' },
                avgDownloads: { $avg: '$downloads' }
            }
        },
        {
            $sort: { totalViews: -1 }
        }
    ]);
};

// Método estático para obtener eventos recientes
imageMetricSchema.statics.getRecentEvents = function(limit = 50) {
    return this.aggregate([
        { $unwind: '$events' },
        { $sort: { 'events.timestamp': -1 } },
        { $limit: limit },
        {
            $project: {
                publicId: 1,
                url: 1,
                folder: 1,
                eventType: '$events.type',
                timestamp: '$events.timestamp',
                metadata: '$events.metadata'
            }
        }
    ]);
};

// Método estático para obtener tendencias
imageMetricSchema.statics.getTrends = function(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        { $unwind: '$events' },
        {
            $match: {
                'events.timestamp': { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$events.timestamp'
                        }
                    },
                    type: '$events.type'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]);
};

export const ImageMetric = model<IImageMetric>('ImageMetric', imageMetricSchema);
