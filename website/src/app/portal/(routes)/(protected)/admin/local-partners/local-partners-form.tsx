'use client';

import { Button } from '@/app/portal/components/button';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { getLocalPartnerAction } from '@/app/portal/server-actions/create-local-partner-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gender } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@socialincome/ui/src/components/form';
import { SpinnerIcon } from '@socialincome/ui/src/icons/spinner';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
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
	const formSchema = z.object({
		name: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		contactFirstName: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		contactLastName: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		gender: z.nativeEnum(Gender),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			contactFirstName: '',
			contactLastName: '',
		},
	});

	const [isLoading, startTransition] = useTransition();
	let editing = !!localPartnerId;

	useEffect(() => {
		if (editing && localPartnerId) {
			// Load local partner in edit mode
			startTransition(async () => {
				try {
					const partner = await getLocalPartnerAction(localPartnerId);
					if (partner.success) {
						form.setValue('name', partner.data.name);
						form.setValue('contactFirstName', partner.data.contact.firstName);
						form.setValue('contactLastName', partner.data.contact.lastName);
						partner.data.contact.gender && form.setValue('gender', partner.data.contact.gender);
					}
				} catch {
					onError && onError();
				}
			});
		}
	}, [localPartnerId]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// TODO update data in edit mode
		debugger;
		if (editing) return;
		startTransition(async () => {
			try {
				// await createLocalPartnerAction({
				// 	name: values.name,
				// 	contact: {
				// 		create: {
				// 			firstName: values.contactFirstName,
				// 			lastName: values.contactLastName,
				// 			gender: values.gender,
				// 		},
				// 	},
				// });
				onSuccess && onSuccess();
			} catch {
				onError && onError();
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<Label>Name</Label>
							<FormControl>
								<Input placeholder="Name" {...field} disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="contactFirstName"
					render={({ field }) => (
						<FormItem>
							<Label>Contact first name</Label>
							<FormControl>
								<Input placeholder="Contact first name" {...field} disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="contactLastName"
					render={({ field }) => (
						<FormItem>
							<Label>Contact last name</Label>
							<FormControl>
								<Input placeholder="Contact last name" {...field} disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<Label>Gender</Label>
							<Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Choose gender" />
									</SelectTrigger>
								</FormControl>
								<SelectContent {...field}>
									{Object.keys(Gender).map((gender) => (
										<SelectItem value={gender} key={gender}>
											{gender}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button disabled={isLoading} type="submit">
					Submit
				</Button>
			</form>
			{isLoading && (
				<div className="space-0 absolute right-0 top-0 flex h-full w-full items-center justify-center bg-white opacity-80">
					<SpinnerIcon />
				</div>
			)}
		</Form>
	);
}
