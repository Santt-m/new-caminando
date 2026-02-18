import mongoose, { Schema } from 'mongoose';

export interface ActivityDocument {
  userId?: string;
  visitorId?: string;
  sessionId?: string;
  method?: string;
  path?: string;
  status?: number;
  ip: string;
  userAgent: string;
  visitorState?: 'ok' | 'blocked' | 'suspicious';
  eventType?: 'REQUEST' | 'THREAT' | 'LOGIN' | 'SYSTEM' | 'AUDIT' | 'SCRAPING' | 'CATEGORY_DISCOVERY_START' | 'CATEGORY_DISCOVERY_SUCCESS' | 'CATEGORY_DISCOVERY_ERROR' | 'BRAND_EXTRACTION_START' | 'BRAND_EXTRACTION_SUCCESS' | 'BRAND_EXTRACTION_ERROR' | 'PRODUCT_SCRAPING_START' | 'PRODUCT_SCRAPING_SUCCESS' | 'PRODUCT_SCRAPING_ERROR' | 'CATEGORY_MAPPING_START' | 'CATEGORY_MAPPING_SUCCESS' | 'CATEGORY_MAPPING_ERROR' | 'BRAND_MATCHING_START' | 'BRAND_MATCHING_SUCCESS' | 'BRAND_MATCHING_ERROR' | 'SCRAPING_SUCCESS' | 'SCRAPING_ERROR' | 'PRODUCT_EXTRACTION_START' | 'PRODUCT_EXTRACTION_SUCCESS' | 'BRAND_MATCH_FAILURE' | 'BRAND_MATCH_ERROR' | 'SELECTOR_FAILURE' | 'BOT_DETECTION' | 'RATE_LIMIT_HIT' | 'NETWORK_ERROR' | 'BOT_BLOCKED' | 'DOM_CHANGE' | 'VALIDATION_ERROR' | 'DOM_CHANGE_DETECTED' | 'CATEGORY_SAVE_SUCCESS' | 'CATEGORY_SAVE_ERROR' | 'BRAND_SAVE_SUCCESS' | 'BRAND_SAVE_ERROR' | 'PRODUCT_SAVE_SUCCESS' | 'PRODUCT_SAVE_ERROR' | 'DATA_PERSISTENCE_SUCCESS' | 'DATA_PERSISTENCE_ERROR' | 'SCREENSHOT_CAPTURED' | 'DATA_SAVED' | 'DATA_VALIDATION_FAILED';
  level: 'debug' | 'info' | 'warn' | 'error' | 'audit' | 'critical';
  module: 'AUTH' | 'DATABASE' | 'ADMIN' | 'SUPPORT' | 'SYSTEM' | 'NETWORK' | 'WORKER' | 'PROCESSOR' | 'BROWSER' | 'SCRAPER' | 'SCRAPER_ENHANCED' | 'SCRAPER_LOGGER' | 'SCRAPER_NODE' | 'BRAND_MATCHING' | 'CATEGORY_MAPPING' | 'BRAND_EXTRACTION' | 'VTEX_SCRAPER' | 'PRODUCT_SAVER';
  message: string;
  details?: Record<string, unknown>;
  ipInfo?: Record<string, unknown>;
  requestId?: string;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ActivitySchema = new Schema<ActivityDocument>(
  {
    userId: { type: String, ref: 'User' },
    visitorId: { type: String, index: true },
    sessionId: { type: String, index: true },
    method: { type: String },
    path: { type: String },
    status: { type: Number },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    visitorState: { type: String, enum: ['ok', 'blocked', 'suspicious'], default: 'ok', index: true },
    eventType: {
      type: String,
      enum: [
        'REQUEST', 'THREAT', 'LOGIN', 'SYSTEM', 'AUDIT', 'SCRAPING',
        'CATEGORY_DISCOVERY_START', 'CATEGORY_DISCOVERY_SUCCESS', 'CATEGORY_DISCOVERY_ERROR',
        'BRAND_EXTRACTION_START', 'BRAND_EXTRACTION_SUCCESS', 'BRAND_EXTRACTION_ERROR',
        'PRODUCT_SCRAPING_START', 'PRODUCT_SCRAPING_SUCCESS', 'PRODUCT_SCRAPING_ERROR',
        'CATEGORY_MAPPING_START', 'CATEGORY_MAPPING_SUCCESS', 'CATEGORY_MAPPING_ERROR',
        'BRAND_MATCHING_START', 'BRAND_MATCHING_SUCCESS', 'BRAND_MATCHING_ERROR',
        'SCRAPING_SUCCESS', 'SCRAPING_ERROR', 'PRODUCT_EXTRACTION_START', 'PRODUCT_EXTRACTION_SUCCESS',
        'BRAND_MATCH_FAILURE', 'BRAND_MATCH_ERROR', 'SELECTOR_FAILURE', 'BOT_DETECTION',
        'RATE_LIMIT_HIT', 'NETWORK_ERROR', 'BOT_BLOCKED', 'DOM_CHANGE', 'VALIDATION_ERROR',
        'DOM_CHANGE_DETECTED', 'CATEGORY_SAVE_SUCCESS', 'CATEGORY_SAVE_ERROR',
        'BRAND_SAVE_SUCCESS', 'BRAND_SAVE_ERROR', 'PRODUCT_SAVE_SUCCESS', 'PRODUCT_SAVE_ERROR',
        'DATA_PERSISTENCE_SUCCESS', 'DATA_PERSISTENCE_ERROR', 'SCREENSHOT_CAPTURED',
        'DATA_SAVED', 'DATA_VALIDATION_FAILED'
      ],
      default: 'REQUEST',
      index: true
    },
    level: { type: String, enum: ['debug', 'info', 'warn', 'error', 'audit', 'critical'], default: 'info', index: true },
    module: {
      type: String,
      enum: [
        'AUTH', 'DATABASE', 'ADMIN', 'SUPPORT', 'SYSTEM', 'NETWORK',
        'WORKER', 'PROCESSOR', 'BROWSER', 'SCRAPER',
        'SCRAPER_ENHANCED', 'SCRAPER_LOGGER', 'SCRAPER_NODE',
        'BRAND_MATCHING', 'CATEGORY_MAPPING', 'BRAND_EXTRACTION',
        'VTEX_SCRAPER', 'PRODUCT_SAVER'
      ],
      required: true,
      index: true
    },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipInfo: { type: Schema.Types.Mixed },
    requestId: { type: String, index: true },
    duration: { type: Number },
  },
  { timestamps: true }
);

ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ path: 1 });
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ module: 1, eventType: 1 });

export const Activity = mongoose.model<ActivityDocument>('Activity', ActivitySchema);
