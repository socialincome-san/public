import { CreateUserData } from '@/app/api/user/create/route';
import { WebsiteRegion } from '@/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { cn } from '@socialincome/ui/src/lib/utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

export type GuestFormTranslations = {
	firstName: string;
	lastName: string;
	email: string;
	proceedAsGuest: string;
	generateQrBill: string;
	errors: {
		guestCouldNotBeCreated: string;
	};
};

type GuestFormProps = {
	region: WebsiteRegion;
	translations: GuestFormTranslations;
	onGuestCreated: ({ paymentReferenceId }: { paymentReferenceId: number }) => Promise<void>;
};

export const GuestForm = ({ region, translations, onGuestCreated }: GuestFormProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = z.object({
		email: z.string().min(1, 'Email is required').email('Invalid email address'),
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			firstName: '',
			lastName: '',
		},
	});

	console.log(form.formState.isValid, 'isvalid');

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			setIsLoading(true);
			const { email, firstName, lastName } = form.getValues();
			const response = await fetch('/api/user/create', {
				method: 'POST',
				body: JSON.stringify({
					email,
					personal: {
						name: firstName,
						lastname: lastName,
					},
					address: {
						country: 'CH', // only CH is supported for now
					},
					currency: 'CHF', // only CHF is supported for now
				} as CreateUserData),
			});

			if (!response.ok) {
				throw new Error('Failed to create user');
			}

			await onGuestCreated({ paymentReferenceId: (await response.json()).payment_reference_id });
		} catch (error) {
			toast.error(translations.errors.guestCouldNotBeCreated);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Typography weight="bold" size="2xl" className="mb-4">
				{translations.proceedAsGuest}
			</Typography>
			<Form {...form}>
				<form className={cn('flex flex-col space-y-2')} onSubmit={handleSubmit}>
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder={translations.firstName} type="text" required {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder={translations.lastName} type="text" required {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder={translations.email} type="email" required {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
						{isLoading ? 'Generating...' : translations.generateQrBill}
					</Button>
				</form>
			</Form>
		</>
	);
};
