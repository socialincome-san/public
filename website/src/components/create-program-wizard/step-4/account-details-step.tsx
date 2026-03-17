'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Props = {
	email: string;
	firstName: string;
	lastName: string;
	onEmailChange: (value: string) => void;
	onFirstNameChange: (value: string) => void;
	onLastNameChange: (value: string) => void;
};

type AccountDetailsFormValues = {
	firstName: string;
	lastName: string;
	email: string;
};

export const AccountDetailsStep = ({
	email,
	firstName,
	lastName,
	onEmailChange,
	onFirstNameChange,
	onLastNameChange,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const accountDetailsSchema = z.object({
		firstName: z.string().trim().min(1, t('step4.validation.first_name_required')),
		lastName: z.string().trim().min(1, t('step4.validation.last_name_required')),
		email: z.string().email(t('step4.validation.email_invalid')),
	});

	const form = useForm<AccountDetailsFormValues>({
		resolver: zodResolver(accountDetailsSchema),
		defaultValues: { email, firstName, lastName },
		mode: 'onChange',
	});

	return (
		<div className="mx-auto max-w-2xl space-y-5 py-2">
			<div className="space-y-2">
				<Typography size="xl" weight="bold">
					{t('step4.title')}
				</Typography>
				<Typography className="text-muted-foreground">{t('step4.description')}</Typography>
			</div>

			<Form {...form}>
				<form onSubmit={(event) => event.preventDefault()} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="create-program-first-name">{t('step4.first_name.label')}</FormLabel>
									<FormControl>
										<Input
											id="create-program-first-name"
											placeholder={t('step4.first_name.placeholder')}
											autoComplete="given-name"
											{...field}
											value={field.value ?? ''}
											onChange={(event) => {
												field.onChange(event);
												onFirstNameChange(event.target.value);
											}}
										/>
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
									<FormLabel htmlFor="create-program-last-name">{t('step4.last_name.label')}</FormLabel>
									<FormControl>
										<Input
											id="create-program-last-name"
											placeholder={t('step4.last_name.placeholder')}
											autoComplete="family-name"
											{...field}
											value={field.value ?? ''}
											onChange={(event) => {
												field.onChange(event);
												onLastNameChange(event.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="create-program-email">{t('step4.email.label')}</FormLabel>
								<FormControl>
									<Input
										id="create-program-email"
										type="email"
										placeholder={t('step4.email.placeholder')}
										autoComplete="email"
										{...field}
										value={field.value ?? ''}
										onChange={(event) => {
											field.onChange(event);
											onEmailChange(event.target.value);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
};
