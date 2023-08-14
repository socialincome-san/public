'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { auth } from '@/firebase/client';
import { BaseContainer, Button, Input } from '@socialincome/ui';
import { browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Formik } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import { useRouter } from 'next/navigation';

type LoginFormValues = {
	email: string;
	password: string;
};

export default function Page({ params }: DefaultPageProps) {
	const router = useRouter();

	const onSubmit = async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
		setSubmitting(true);
		await auth.setPersistence(browserSessionPersistence);
		await signInWithEmailAndPassword(auth, values.email, values.password);
		setSubmitting(false);
		router.push(`${params.lang}/${params.country}/me`);
	};

	return (
		<BaseContainer className="bg-base-blue">
			<Formik
				initialValues={{ email: '', password: '' }}
				validate={(values) => {
					if (!values.email) {
						return { email: 'Required' };
					} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
						return { email: 'Invalid email address' };
					}
				}}
				onSubmit={onSubmit}
			>
				{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
					<form className="flex min-h-screen max-w-3xl flex-col space-y-2" onSubmit={handleSubmit}>
						<Input
							type="email"
							name="email"
							placeholder="Email"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.email}
						/>
						{errors.email && touched.email && errors.email}
						<Input
							type="password"
							name="password"
							placeholder="Password"
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
		</BaseContainer>
	);
}
