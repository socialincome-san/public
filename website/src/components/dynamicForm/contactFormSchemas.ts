import { Gender } from '@prisma/client';
import z from 'zod';
import { FormSchema } from './dynamicForm';

export const formSchema: FormSchema = {
	firstName: {
		placeholder: 'First Name',
		label: 'First Name',
	},
	lastName: {
		placeholder: 'Last Name',
		label: 'Last Name',
	},
	callingName: {
		placeholder: 'Calling Name',
		label: 'Calling Name',
	},
	email: {
		placeholder: 'Email',
		label: 'Email',
	},
	language: {
		placeholder: 'Language',
		label: 'Language',
	},
	dateOfBirth: {
		placeholder: 'Date of birth',
		label: 'Date of birth',
	},
	profession: {
		placeholder: 'Profession',
		label: 'Profession',
	},
	gender: {
		placeholder: 'Choose Gender',
		label: 'Gender',
	},
	phone: {
		placeholder: 'Phone Number',
		label: 'Phone Number',
	},
	address: {
		strees: {},
		number: {},
		city: {},
		zip: {},
		country: {},
	},
};

export const zodSchema = z.object({
	firstName: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	lastName: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	callingName: z.string().optional(),
	email: z.string().email(),
	language: z.string().optional(),
	dateOfBirth: z.date().max(new Date(), { message: 'Too young!' }).optional(),
	profession: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	phone: z
		.string()
		// TODO: chek regex and optional
		.regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/gm)
		.optional(),
});
