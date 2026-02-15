import mongoose, { Schema } from 'mongoose';

export interface UserDocument {
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  isActive: boolean;
  preferences?: {
    currency?: 'ARS' | 'USD' | 'PEN';
    language?: 'es' | 'en' | 'pt';
    theme?: string;
    notifications?: {
      recurringReminders?: boolean;
      newsletter?: boolean;
      syncCompleted?: boolean;
    };
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dni?: string;
    gender?: 'M' | 'F' | 'X';
    phone?: { areaCode: string; number: string };
    dateOfBirth?: { day: string; month: string; year: string };
    address?: { street: string; number: string; city?: string; zipCode?: string; floor?: string; apartment?: string };
  };
  createdAt?: Date;
  updatedAt?: Date;
  acquisition?: {
    source: string;
    medium: string;
    campaignDate: Date;
  };
  emailVerified: boolean;
  verificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
    preferences: {
      currency: { type: String, default: 'ARS' },
      language: { type: String, default: 'es' },
      theme: { type: String, default: 'claro' },
      notifications: {
        recurringReminders: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: false },
        syncCompleted: { type: Boolean, default: true },
      },
    },
    profile: {
      firstName: { type: String },
      lastName: { type: String },
      bio: { type: String },
      dni: { type: String },
      gender: { type: String },
      phone: {
        areaCode: { type: String },
        number: { type: String },
      },
      dateOfBirth: {
        day: { type: String },
        month: { type: String },
        year: { type: String },
      },
      address: {
        street: { type: String },
        number: { type: String },
        city: { type: String },
        zipCode: { type: String },
        floor: { type: String },
        apartment: { type: String },
      },
    },
    acquisition: {
      source: { type: String },
      medium: { type: String },
      campaignDate: { type: Date },
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<UserDocument>('User', UserSchema);
