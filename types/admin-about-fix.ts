'use server';

import { HeroSlideFormValues, AboutSectionSchema } from '@/lib/validations/admin';
import { z } from 'zod';

export type AboutSectionFormValues = z.infer<typeof AboutSectionSchema>;
