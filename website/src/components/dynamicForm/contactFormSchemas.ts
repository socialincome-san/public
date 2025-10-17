import { Gender } from '@prisma/client';
import z from 'zod';
import { FormSchema } from './dynamicForm';

export const formSchema: FormSchema = {
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
		zodSchema: z.string().optional(),
	},
	email: {
		placeholder: 'Email',
		label: 'Email',
		zodSchema: z.string().email(),
	},
	language: {
		placeholder: 'Language',
		label: 'Language',
		zodSchema: z.string().optional(),
	},
	dateOfBirth: {
		placeholder: 'Date of birth',
		label: 'Date of birth',
		zodSchema: z.date().max(new Date(), { message: 'Too young!' }).optional(),
	},
	profession: {
		placeholder: 'Profession',
		label: 'Profession',
		zodSchema: z.string().optional(),
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
			.optional(),
	},
	// address: {
	// 	strees: {},
	// 	number: {},
	// 	city: {},
	// 	zip: {},
	// 	country: {},
	// },
};

// export const zodSchema = z.object({
// 	firstName: z.string().min(2, {
// 		message: 'Name must be at least 2 characters.',
// 	}),
// 	lastName: z.string().min(2, {
// 		message: 'Name must be at least 2 characters.',
// 	}),
// 	callingName: z.string().optional(),
// 	email: z.string().email(),
// 	language: z.string().optional(),
// 	dateOfBirth: z.date().max(new Date(), { message: 'Too young!' }).optional(),
// 	profession: z.string().optional(),
// 	gender: z.nativeEnum(Gender).optional(),
// 	phone: z
// 		.string()
// 		// TODO: chek regex and optional
// 		.regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/gm)
// 		.optional(),
// });
