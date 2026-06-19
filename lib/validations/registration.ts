import { z } from 'zod';

export const registrationSchema = z.object({
    event_id: z.string().uuid('ID event invalid'),
    full_name: z.string().min(2, 'Last name name phải có ít nhất 2 characters'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Phone number invalid (10-11 số)'),
    email: z.string().email('Email invalid').optional().or(z.literal('')),
    num_participants: z.number().min(1, 'Số người tham gia phải ít nhất 1').max(50, 'Số người tham gia maximum 50'),
    note: z.string().max(500, 'Ghi chú không được quá 500 characters').optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
