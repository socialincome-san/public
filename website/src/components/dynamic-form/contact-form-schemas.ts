import { Gender } from '@prisma/client';
import z from 'zod';
import { FormSchema } from './dynamic-form';

export const getFormSchema = (options?: { isEmailRequired: boolean }): FormSchema => {
	return {
		label: 'Contact',
		fields: {
			firstName: {
				placeholder: 'First Name',
				label: 'First Name',
				zodSchema: z.string().min(2, {
					message: 'Name must be at least 2 characters.',
				}),
			},
			lastName: {
				placeholder: 'Last Name',
				label: 'Last Name',
				zodSchema: z.string().min(2, {
					message: 'Name must be at least 2 characters.',
				}),
			},
			callingName: {
				placeholder: 'Calling Name',
				label: 'Calling Name',
				zodSchema: z.string().nullable(),
			},
			email: {
				placeholder: 'Email',
				label: 'Email',
				zodSchema: options?.isEmailRequired ? z.string().email() : z.string().email().or(z.literal('')).optional(),
			},
			language: {
				placeholder: 'Language',
				label: 'Language',
				zodSchema: z.string().nullable(),
			},
			dateOfBirth: {
				label: 'Date of birth',
				zodSchema: z.date().max(new Date(), { message: 'Too young!' }).optional(),
			},
			profession: {
				placeholder: 'Profession',
				label: 'Profession',
				zodSchema: z.string().nullable(),
			},
			gender: {
				placeholder: 'Choose Gender',
				label: 'Gender',
				zodSchema: z.nativeEnum(Gender).optional(),
			},
			phone: {
				placeholder: 'Phone Number',
				label: 'Phone Number',
				zodSchema: z
					.string()
					// TODO: chek regex and optional
					.regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/gm)
					.or(z.literal(''))
					.optional(),
			},
			hasWhatsApp: {
				label: 'Has WhatsApp',
				zodSchema: z.boolean().optional(),
			},
			street: {
				placeholder: 'Street',
				label: 'Address Street',
				zodSchema: z.string().min(2),
			},
			number: {
				placeholder: 'Number',
				label: 'Address Number',
				zodSchema: z.string().min(1),
			},
			city: {
				placeholder: 'City',
				label: 'Address City',
				zodSchema: z.string().min(2),
			},
			zip: {
				placeholder: 'ZIP',
				label: 'Address ZIP Code',
				zodSchema: z.string().min(2),
			},
			country: { placeholder: 'Country', label: 'Address Country', zodSchema: z.string().min(2) },
		},
	};
};
