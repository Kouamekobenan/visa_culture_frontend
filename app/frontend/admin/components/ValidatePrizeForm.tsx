import * as z from 'zod';

export const createPrizeSchema = z.object({
  title: z.string().min(2, 'Le titre est requis'),
  description: z.string().min(5, 'La description est requise'),
  lotterId: z.string().min(1, 'ID de tombola requis'),
});

export type CreatePrizeFormValues = z.infer<typeof createPrizeSchema>;
