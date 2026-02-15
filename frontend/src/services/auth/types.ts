import { z } from 'zod';

// Schema de Usuario
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().url().optional(),
    language: z.enum(['es', 'en', 'pt']),
    emailVerified: z.boolean(),
    provider: z.enum(['local', 'google']),
    createdAt: z.string().datetime(),
    preferences: z.object({
        notifications: z.boolean().optional(),
        newsletter: z.boolean().optional(),
        theme: z.string().optional(),
    }),
    profile: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        bio: z.string().optional(),
        dni: z.string().optional(),
        gender: z.enum(['M', 'F', 'X']).optional(),
        phone: z.object({
            areaCode: z.string(),
            number: z.string()
        }).optional(),
        dateOfBirth: z.object({
            day: z.string(),
            month: z.string(),
            year: z.string()
        }).optional(),
        address: z.object({
            street: z.string(),
            number: z.string(),
            city: z.string().optional(),
            zipCode: z.string().optional(),
            floor: z.string().optional(),
            apartment: z.string().optional()
        }).optional()
    }).optional(),
});

export type User = z.infer<typeof UserSchema>;

// ... (Rest of file until UpdateProfileRequest)

// Schema de Request de Actualización de Preferencias
export const UpdatePreferencesRequestSchema = z.object({
    currency: z.string().optional(),
    language: z.string().optional(),
    theme: z.string().optional(),
    notifications: z.object({
        recurringReminders: z.boolean().optional(),
        newsletter: z.boolean().optional(),
        syncCompleted: z.boolean().optional(),
    }).optional(),
});

export type UpdatePreferencesRequest = z.infer<typeof UpdatePreferencesRequestSchema>;

// ... (Rest of file)

// Schema de Request de Registro
export const RegisterRequestSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    name: z.string().min(2, 'Nombre muy corto'),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'Debes aceptar los términos',
    }),
    language: z.enum(['es', 'en', 'pt']).optional(),
    deviceId: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Schema de Request de Login
export const LoginRequestSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
    rememberMe: z.boolean().optional(),
    deviceId: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Schema de Response de Auth (Register/Login)
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Schema de Request de Actualización de Perfil
export const UpdateProfileRequestSchema = z.object({
    name: z.string().min(2).optional(),
    language: z.enum(['es', 'en', 'pt']).optional(),
    avatar: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Schema de Request de Cambio de Contraseña
export const ChangePasswordRequestSchema = z.object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Schema de Request de Recuperación de Contraseña
export const ForgotPasswordRequestSchema = z.object({
    email: z.string().email('Email inválido'),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

// Schema de Request de Reset de Contraseña
export const ResetPasswordRequestSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
