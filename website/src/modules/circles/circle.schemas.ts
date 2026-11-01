import { isWebsiteLanguage } from '@/lib/i18n/utils';
import { z } from 'zod';

export const circleLanguageSchema = z.string().trim().refine(isWebsiteLanguage);
