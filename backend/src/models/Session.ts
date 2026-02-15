import mongoose, { Schema } from 'mongoose';

export interface SessionDocument {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  refreshTokenId: string;
  ip: string;
  userAgent: string;
  ipInfo?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date | null;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true },
    refreshTokenId: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    ipInfo: { type: Schema.Types.Mixed },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
SessionSchema.index({ refreshTokenId: 1 });
SessionSchema.index({ revokedAt: 1 });
SessionSchema.index({ lastUsedAt: 1 });

export const Session = mongoose.model<SessionDocument>('Session', SessionSchema);
