'use client';

import { Button, Input } from '@socialincome/ui';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';

interface Section1InputProps {
	text: string;
}

// TODO: i18n
export default function Section1Input({ text }: Section1InputProps) {
	const router = useRouter();

	const onSubmit = (values: { amount: number | string }) => {
		router.push(`/donate/individual?amount=${(Number(values.amount) / 100).toFixed(2)}`);
	};

	return (
		<Formik
			initialValues={{ amount: '' }}
			onSubmit={onSubmit}
			validate={(values) => {
				if (!values.amount) {
					return { amount: true };
				}
			}}
		>
			{({ values, handleChange, handleBlur, errors, handleSubmit }) => (
				<Form className="flex max-w-3xl flex-col space-y-4" onSubmit={handleSubmit}>
					<Field
						as={Input}
						type="number"
						name="amount"
						placeholder="Amount"
						onChange={handleChange}
						onBlur={handleBlur}
						color={errors.amount ? 'error' : 'primary'}
						value={values.amount}
					/>
					<Button type="submit" color="primary" size="lg">
						{text}
					</Button>
				</Form>
			)}
		</Formik>
	);
}
