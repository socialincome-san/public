import { CountryCode } from '@/generated/prisma/enums';
import { z } from 'zod';

export const chosenCountrySchema = z.nativeEnum(CountryCode).nullable();
