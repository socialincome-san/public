import { z } from 'zod';

export const circleLanguageSchema = z.string().trim().min(1);
