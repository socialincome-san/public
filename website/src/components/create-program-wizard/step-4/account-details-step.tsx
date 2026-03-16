'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
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

const accountDetailsSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required.'),
	lastName: z.string().trim().min(1, 'Last name is required.'),
	email: z.string().email('Please enter a valid email address.'),
});

type AccountDetailsFormValues = z.infer<typeof accountDetailsSchema>;

export const AccountDetailsStep = ({
	email,
	firstName,
	lastName,
	onEmailChange,
	onFirstNameChange,
	onLastNameChange,
}: Props) => {
	const form = useForm<AccountDetailsFormValues>({
		resolver: zodResolver(accountDetailsSchema),
		defaultValues: { email, firstName, lastName },
		mode: 'onChange',
	});

	return (
		<div className="space-y-5 py-2">
			<div className="space-y-2">
				<Typography size="xl" weight="bold">
					Almost there
				</Typography>
				<Typography className="text-muted-foreground">
					Add your details to create your account, your organization, and your program.
				</Typography>
			</div>

			<Form {...form}>
				<form onSubmit={(event) => event.preventDefault()} className="space-y-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="create-program-first-name">First name</FormLabel>
								<FormControl>
									<Input
										id="create-program-first-name"
										placeholder="First name"
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
								<FormLabel htmlFor="create-program-last-name">Last name</FormLabel>
								<FormControl>
									<Input
										id="create-program-last-name"
										placeholder="Last name"
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

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="create-program-email">Email</FormLabel>
								<FormControl>
									<Input
										id="create-program-email"
										type="email"
										placeholder="name@example.com"
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
