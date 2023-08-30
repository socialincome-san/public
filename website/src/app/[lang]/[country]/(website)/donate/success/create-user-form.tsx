'use client';

import { Button, Input, Typography } from '@socialincome/ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

type CreateUserFormProps = {
	email: string;
	checkoutSessionId: string;
};

export function CreateUserForm({ checkoutSessionId, email }: CreateUserFormProps) {
	const router = useRouter();
	const auth = useAuth();

	const onSubmit = async () => {
		createUserWithEmailAndPassword(auth, email, 'hallotest')
			.then(async (userCredential) => {
				const user = userCredential.user;
				await fetch(
					`${window.location.origin}/api/stripe/checkout/success?stripeCheckoutSessionId=${checkoutSessionId}&userId=${user.uid}`,
				);
				router.push('/me');
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<Formik
			initialValues={{ password: '' }}
			validate={(values) => {
				if (!values.password) {
					return { password: 'Required' };
				}
			}}
			onSubmit={onSubmit}
		>
			{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
				<form className="flex max-w-3xl flex-col space-y-2" onSubmit={handleSubmit}>
					<Typography>{email}</Typography>
					<Input
						type="password"
						name="password"
						placeholder="Password" // TODO: i18n
						onChange={handleChange}
						onBlur={handleBlur}
						value={values.password}
					/>
					{errors.password && touched.password && errors.password}
					<Button type="submit" color="primary" disabled={isSubmitting}>
						Submit
					</Button>
				</form>
			)}
		</Formik>
	);
}
