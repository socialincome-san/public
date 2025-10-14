'use client';

import {
	createLocalPartnerAction,
	getLocalPartnerAction,
} from '@/app/portal/server-actions/create-local-partner-action';
import DynamicForm, { FormSchema } from '@/components/dynamicForm/dynamicForm';
import { Gender } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

export default function LocalPartnersForm({
	onSuccess,
	onError,
	localPartnerId,
}: {
	onSuccess?: () => void;
	onError?: () => void;
	localPartnerId?: string;
}) {
	// TODO
	const initialFormSchema: FormSchema = {
		name: {
			placeholder: 'Name',
			label: 'Name',
		},
		contactFirstName: {
			placeholder: 'First Name',
			label: 'First Name',
		},
		contactLastName: {
			placeholder: 'Last Name',
			label: 'Last Name',
		},
		contactCallingName: {
			placeholder: 'Calling Name',
			label: 'Calling Name',
		},
		contactEmail: {
			placeholder: 'Email',
			label: 'Email',
		},
		contactLanguage: {
			placeholder: 'Language',
			label: 'Language',
		},
		contactDateOfBirth: {
			placeholder: 'Date of birth',
			label: 'Date of birth',
		},
		contactProfession: {
			placeholder: 'Profession',
			label: 'Profession',
		},
		gender: {
			placeholder: 'Choose Gender',
			label: 'Gender',
		},
	};

	const zodSchema = z.object({
		name: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		contactFirstName: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		contactLastName: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		contactCallingName: z.string().optional(),
		contactEmail: z.string().email(),
		contactLanguage: z.string().optional(),
		contactDateOfBirth: z.date().max(new Date(), { message: 'Too young!' }).optional(),
		contactProfession: z.string(),
		gender: z.nativeEnum(Gender).optional(),
	});

	const [formSchema, setFormSchema] = useState<FormSchema>(initialFormSchema);

	let editing = !!localPartnerId;

	// TODO
	useEffect(() => {
		if (editing && localPartnerId) {
			// Load local partner in edit mode
			startTransition(async () => {
				try {
					const partner = await getLocalPartnerAction(localPartnerId);
					if (partner.success) {
						const newSchema = { ...formSchema };
						newSchema.name.value = partner.data.name;
						newSchema.contactFirstName.value = partner.data.contact.firstName;
						newSchema.contactLastName.value = partner.data.contact.lastName;
						// TODO
						newSchema.gender.value = partner.data.contact.gender?.toString();
						setFormSchema(newSchema);
					}
				} catch {
					onError && onError();
				}
			});
		}
	}, [localPartnerId]);

	const [isLoading, startTransition] = useTransition();
	async function onSubmit(values: z.infer<typeof zodSchema>) {
		// TODO update data in edit mode
		debugger;
		if (editing) return;
		startTransition(async () => {
			try {
				await createLocalPartnerAction({
					name: values.name,
					contact: {
						create: {
							firstName: values.contactFirstName,
							lastName: values.contactLastName,
							gender: values.gender,
							email: '',
						},
					},
				});
				onSuccess && onSuccess();
			} catch {
				onError && onError();
			}
		});
	}

	return <DynamicForm formSchema={formSchema} zodSchema={zodSchema} isLoading={isLoading} onSubmit={onSubmit} />;
}
