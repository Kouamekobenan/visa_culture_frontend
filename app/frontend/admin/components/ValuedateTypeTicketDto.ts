import * as z from 'zod';

export const createTicketSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    price: z.coerce.number().min(0, 'Le prix ne peut pas être négatif'),
    quantity: z.coerce
      .number()
      .int()
      .min(1, "La quantité doit être d'au moins 1"),
    maxPerUser: z.coerce
      .number()
      .int()
      .min(1, 'Minimum 1 ticket par utilisateur'),
    saleStart: z.string().min(1, 'Date de début requise'),
    saleEnd: z.string().min(1, 'Date de fin requise'),
    eventId: z.string().uuid("ID d'événement invalide"),
  })
  .refine((data) => new Date(data.saleEnd) > new Date(data.saleStart), {
    message: 'La date de fin doit être après la date de début',
    path: ['saleEnd'],
  });
export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
