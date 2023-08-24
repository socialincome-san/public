'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { auth } from '@/firebase/client';
import { useTranslator } from '@/hooks/useTranslator';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { BaseContainer, Button, Input, Typography } from '@socialincome/ui';
import { browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Formik } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LoginFormValues = {
	email: string;
	password: string;
};

export default function Page({ params }: DefaultPageProps) {
	const router = useRouter();
	const translator = useTranslator(params.lang, 'website-me');

	const onSubmit = async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
		setSubmitting(true);
		await auth.setPersistence(browserSessionPersistence);
		await signInWithEmailAndPassword(auth, values.email, values.password);
		setSubmitting(false);
		router.push('./');
	};

	return (
		<BaseContainer className="bg-base-blue">
			<div className="mx-auto flex min-h-screen max-w-xl flex-col space-y-8">
				<Formik
					initialValues={{ email: '', password: '' }}
					validate={(values) => {
						if (!values.email) {
							return { email: translator?.t('login.required-field') };
						} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
							return { email: translator?.t('login.invalid-email') };
						} else if (!values.password) {
							return { password: translator?.t('login.invalid-email') };
						}
					}}
					onSubmit={onSubmit}
				>
					{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
						<form className="flex flex-col" onSubmit={handleSubmit}>
							<Typography weight="bold" size="3xl" className="my-4">
								{translator?.t('login.title')}
							</Typography>
							<Input
								type="email"
								name="email"
								placeholder={translator?.t('login.email')}
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
								placeholder={translator?.t('login.password')}
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.password}
								className="my-2"
							/>
							<Link href="./login/password-reset">
								<Typography size="sm" className="-mt-1.5 text-right">
									{translator?.t('login.forgot-password')}
								</Typography>
							</Link>
							<Typography size="sm" color="error" className="-mt-4">
								{errors.password && touched.password && errors.password}
							</Typography>
							<Button type="submit" color="primary" disabled={isSubmitting} className="mt-8">
								{translator?.t('login.submit-button')}
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
		</BaseContainer>
	);
}
