import { z } from 'zod';

export const tourStepSchema = z.object({
    element: z.string().min(1, "El selector CSS es requerido (ej: '#id-elemento')"),
    popover: z.object({
        title: z.string().optional(),
        description: z.string().min(1, "La descripción del paso es requerida"),
        side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
        align: z.enum(['start', 'center', 'end']).optional(),
    }),
});

export const tourSchema = z.array(tourStepSchema);

export type TourStep = z.infer<typeof tourStepSchema>;
