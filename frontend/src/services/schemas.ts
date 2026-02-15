import { z } from 'zod';

// ============================================
// Schemas de Validación
// ============================================

// Tiendas (genérico)
export const SupermercadoSchema = z.string();

// Currency
export const CurrencySchema = z.enum(['ARS', 'USD', 'PEN']);

// Language
export const LanguageSchema = z.enum(['es', 'en', 'pt']);

// ============================================
// Autenticación
// ============================================

export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    rememberMe: z.boolean().optional(),
});

export const RegisterSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export const UserPreferencesSchema = z.object({
    currency: CurrencySchema,
    language: LanguageSchema,
    notifications: z.object({
        recurringReminders: z.boolean(),
        newsletter: z.boolean(),
        syncCompleted: z.boolean(),
    }),
});

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().url().optional(),
    bio: z.string().optional(),
    provider: z.enum(['email', 'google']),
    createdAt: z.string().datetime(),
    preferences: UserPreferencesSchema,
});

// ============================================
// Productos
// ============================================

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    brand: z.string(),
    category: z.string(),
    ean: z.string(),
    imageUrl: z.string().url(),
    description: z.string(),
});

export const ProductFiltersSchema = z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    priceRange: z
        .object({
            min: z.number().nonnegative(),
            max: z.number().positive(),
        })
        .optional(),
    onlyAvailable: z.boolean().optional(),
});

// ============================================
// Listas de Compras
// ============================================

export const ShoppingListItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
});

export const ShoppingListSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string().min(1, 'El nombre es requerido'),
    icon: z.string(),
    items: z.array(ShoppingListItemSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    lastSyncedAt: z.string().datetime().optional(),
});

export const CreateShoppingListSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    icon: z.string().optional().default('🛒'),
});

export const UpdateShoppingListSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    icon: z.string().optional(),
    items: z.array(ShoppingListItemSchema).optional(),
});

// ============================================
// Credenciales
// ============================================

export const SupermarketCredentialSchema = z.object({
    id: z.string(),
    userId: z.string(),
    supermercado: SupermercadoSchema,
    username: z.string(),
    status: z.enum(['active', 'error', 'not_configured']),
    lastSync: z.string().datetime().optional(),
    errorMessage: z.string().optional(),
});

export const CreateCredentialSchema = z.object({
    supermercado: SupermercadoSchema,
    username: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

// ============================================
// Compras
// ============================================

export const PurchaseItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    supermercado: SupermercadoSchema,
});

export const PurchaseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    listId: z.string().optional(),
    supermercados: z.array(SupermercadoSchema),
    total: z.number().positive(),
    savings: z.number().nonnegative(),
    status: z.enum(['completed', 'partial', 'failed']),
    items: z.array(PurchaseItemSchema),
    createdAt: z.string().datetime(),
});

// ============================================
// Notificaciones
// ============================================

export const NotificationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.enum(['sync_completed', 'system', 'reminder']),
    title: z.string(),
    message: z.string(),
    createdAt: z.string().datetime(),
    read: z.boolean(),
    actionUrl: z.string().url().optional(),
});

// ============================================
// Tipos inferidos de los schemas
// ============================================

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProductFiltersInput = z.infer<typeof ProductFiltersSchema>;
export type CreateShoppingListInput = z.infer<typeof CreateShoppingListSchema>;
export type UpdateShoppingListInput = z.infer<typeof UpdateShoppingListSchema>;
export type CreateCredentialInput = z.infer<typeof CreateCredentialSchema>;
