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
  eventType?: 'REQUEST' | 'THREAT' | 'LOGIN' | 'SYSTEM' | 'AUDIT' | 'SCRAPING';
  level: 'debug' | 'info' | 'warn' | 'error' | 'audit';
  module: 'AUTH' | 'DATABASE' | 'ADMIN' | 'SUPPORT' | 'SYSTEM' | 'NETWORK' | 'WORKER' | 'PROCESSOR' | 'BROWSER' | 'SCRAPER';
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
    eventType: { type: String, enum: ['REQUEST', 'THREAT', 'LOGIN', 'SYSTEM', 'AUDIT', 'SCRAPING'], default: 'REQUEST', index: true },
    level: { type: String, enum: ['debug', 'info', 'warn', 'error', 'audit'], default: 'info', index: true },
    module: { type: String, enum: ['AUTH', 'DATABASE', 'ADMIN', 'SUPPORT', 'SYSTEM', 'NETWORK', 'WORKER', 'PROCESSOR', 'BROWSER', 'SCRAPER'], required: true, index: true },
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
