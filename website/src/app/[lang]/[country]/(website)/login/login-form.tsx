'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Formik } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import _ from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';

type LoginFormValues = {
	email: string;
	password: string;
};

type LoginFormProps = {
	translations: {
		title: string;
		email: string;
		password: string;
		forgotPassword: string;
		submitButton: string;

		// Errors
		requiredField: string;
		invalidEmail: string;
		unknownUser: string;
		wrongPassword: string;
	};
} & DefaultPageProps;

export default function LoginForm({ params, translations }: LoginFormProps) {
	const router = useRouter();
	const auth = useAuth();

	const onSubmit = async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
		setSubmitting(true);
		await auth.setPersistence(browserSessionPersistence);
		await signInWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				router.push(`/${params.lang}/${params.country}/me`);
			})
			.catch((error: FirebaseError) => {
				error.code === 'auth/wrong-password' && toast.error(translations.wrongPassword);
				error.code === 'auth/user-not-found' && toast.error(translations.unknownUser);
			});
		setSubmitting(false);
	};

	return (
		<div className="mx-auto flex max-w-xl flex-col space-y-8">
			<Formik
				initialValues={{ email: '', password: '' }}
				validate={(values) => {
					if (!values.email) {
						return { email: translations.requiredField };
					} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
						return { email: translations.invalidEmail };
					} else if (!values.password) {
						return { password: translations.requiredField };
					}
				}}
				onSubmit={onSubmit}
			>
				{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
					<form className="flex flex-col" onSubmit={handleSubmit}>
						<Typography weight="bold" size="3xl" className="my-4">
							{translations.title}
						</Typography>
						<Input
							type="email"
							name="email"
							placeholder={translations.email}
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.email}
							className="my-2"
						/>
						<Typography size="sm" color="error" className="-mt-2">
							{errors.email && touched.email && errors.email}
						</Typography>
						<Input
							type="password"
							name="password"
							placeholder={translations.password}
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.password}
							className="my-2"
						/>
						<Link href="./login/password-reset">
							<Typography size="sm" className="-mt-1.5 text-right">
								{translations.forgotPassword}
							</Typography>
						</Link>
						<Typography size="sm" color="error" className="-mt-4">
							{errors.password && touched.password && errors.password}
						</Typography>
						<Button
							type="submit"
							color="accent"
							disabled={isSubmitting || _.isEmpty(values.email) || _.isEmpty(values.password)}
							className="mt-8"
						>
							{translations.submitButton}
						</Button>
					</form>
				)}
			</Formik>
			<div className="mx-auto flex max-w-md flex-col">
				<Button variant="outline" className="inline-flex" onClick={() => alert('Coming soon')}>
					<SiGoogle className="h-5 w-5" />
					Continue with Google
				</Button>
			</div>
		</div>
	);
}
