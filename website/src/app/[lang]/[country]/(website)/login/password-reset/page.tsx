'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Button, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Formik } from 'formik';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';

// TODO: i18n
export default function Page({ params }: DefaultPageProps) {
	const auth = useAuth();

	const onSubmit = async (values: { email: string }) => {
		const message = 'You should have received an email with a link to reset your password.';

		await sendPasswordResetEmail(auth, values.email)
			.then(() => {
				toast.success(message);
			})
			.catch(async (error: FirebaseError) => {
				// If the auth user does not exist, we need to call our API and check if there exists a firestore user with the
				// same email and create an auth user for it. Then we can send the password reset email.
				if (error.code === 'auth/user-not-found') {
					const responseJSON = await (
						await fetch('/api/user/create-auth-user', {
							method: 'POST',
							body: JSON.stringify(values),
						})
					).json();
					if (responseJSON.created) {
						sendPasswordResetEmail(auth, values.email).then(() => {
							toast.success(message);
						});
					} else {
						toast.success(message);
					}
				}
			});
	};

	return (
		<div className="mx-auto flex max-w-xl flex-col space-y-4 pt-16">
			<Typography size="2xl" weight="medium">
				Enter your Email
			</Typography>
			<Formik
				initialValues={{ email: '' }}
				validate={(values) => {
					if (!values.email) {
						return { email: 'Required' };
					} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
						return { email: 'Invalid Email address' };
					}
				}}
				onSubmit={onSubmit}
			>
				{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
					<form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
						<Input
							type="email"
							name="email"
							placeholder="Email"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.email}
						/>
						{errors.email && touched.email && errors.email}
						<Button type="submit" color="primary" disabled={isSubmitting}>
							Submit
						</Button>
					</form>
				)}
			</Formik>
		</div>
	);
}
