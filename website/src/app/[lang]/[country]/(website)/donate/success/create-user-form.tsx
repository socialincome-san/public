'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from 'reactfire';
import * as z from 'zod';

type CreateUserFormProps = {
	email: string;
	checkoutSessionId: string;
	translations: {
		title: string;
		password: string;
		submitButton: string;
		invalidEmail: string;
	};
};

export function CreateUserForm({ checkoutSessionId, email, translations }: CreateUserFormProps) {
	const router = useRouter();
	const auth = useAuth();

	const formSchema = z.object({
		password: z.string(),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { password: '' },
	});

	const onSubmit = async () => {
		createUserWithEmailAndPassword(auth, email, 'hallotest')
			.then(async (userCredential) => {
				const user = userCredential.user;
				await fetch(`/api/stripe/checkout/success?stripeCheckoutSessionId=${checkoutSessionId}&userId=${user.uid}`);
				router.push('/me');
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<Form {...form}>
			<form className="flex flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="bold" size="3xl" className="my-4">
					{translations.title}
				</Typography>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.password} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">{translations.submitButton}</Button>
			</form>
		</Form>
	);
}
