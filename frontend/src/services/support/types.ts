import { z } from 'zod';

export const CreateTicketSchema = z.object({
    email: z.string().email("Email inválido"),
    type: z.enum(['support', 'feedback', 'bug_report', 'contacto', 'reporte_error']),
    subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
    message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
    user_id: z.string().optional(),
    metadata: z.object({
        error_stack: z.string().optional(),
        component_stack: z.string().optional(),
        url: z.string().optional(),
        browser_info: z.string().optional(),
        timestamp: z.string().optional(),
    }).optional()
});

export type CreateTicketDTO = z.infer<typeof CreateTicketSchema>;
