'use client';

import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types';
import { Button, Input, Select, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import assert from 'assert';
import { QueryDocumentSnapshot, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Formik } from 'formik';
import toast from 'react-hot-toast';
import { useFirestore, useUser } from 'reactfire';

type UserFormValues = {
	firstname: string;
	lastname: string;
	gender: string;
	email: string;
	street: string;
	streetNumber: string;
	city: string;
	zip: string;
};

// TODO: i18n

export default function Page() {
	const firestore = useFirestore();
	const { data: authUser } = useUser();

	const { data: user } = useQuery(
		[authUser, firestore],
		async () => {
			if (authUser && firestore) {
				let snapshot = await getDocs(
					query(collection(firestore, USER_FIRESTORE_PATH), where('authUserId', '==', authUser?.uid)),
				);
				assert(snapshot.size === 1);
				return snapshot.docs[0] as QueryDocumentSnapshot<User>;
			} else return null;
		},
		{
			staleTime: 1000 * 60 * 60, // 1 hour
		},
	);

	const onSubmit = async (values: UserFormValues) => {
		await updateDoc(doc(firestore, USER_FIRESTORE_PATH, user!.id), {
			personal: {
				name: values.firstname,
				lastname: values.lastname,
				gender: values.gender,
			},
			email: values.email,
			address: {
				street: values.street,
				number: values.streetNumber,
				city: values.city,
				zip: values.zip,
			},
		}).then(() => {
			toast.success('User updated');
		});
	};

	if (!user) return null;

	const initialValues: UserFormValues = {
		firstname: user.get('personal.name') || '',
		lastname: user.get('personal.lastname') || '',
		gender: user.get('personal.gender') || '',
		email: user.get('email') || '',
		street: user.get('address.street') || '',
		streetNumber: user.get('address.number') || '',
		city: user.get('address.city') || '',
		zip: user.get('address.zip') || '',
	};

	return (
		<Formik initialValues={initialValues} onSubmit={onSubmit}>
			{({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
				<form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
					<div className="flex flex-col">
						<Typography>First name</Typography>
						<Input
							type="text"
							name="firstname"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.firstname}
							className="mt-1"
						/>
					</div>
					<div className="flex flex-col">
						<Typography>Last name</Typography>
						<Input
							type="text"
							name="lastname"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.lastname}
							className="mt-1"
						/>
					</div>
					<div className="flex flex-col">
						<Typography>Email</Typography>
						<Input
							type="email"
							name="email"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.email}
							className="mt-1"
						/>
					</div>
					<div className="flex flex-col">
						<Typography>Gender</Typography>
						<Select
							name="gender"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.gender}
							className="mt-1 text-base font-normal"
						>
							<Select.Option value="" disabled>
								Select
							</Select.Option>
							<Select.Option value="male">Male</Select.Option>
							<Select.Option value="female">Female</Select.Option>
							<Select.Option value="other">Other</Select.Option>
						</Select>
					</div>
					<div className="flex flex-row space-x-2">
						<div className="flex w-3/4 flex-col">
							<Typography>Street</Typography>
							<Input
								type="text"
								name="street"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.street}
								className="mt-1"
							/>
						</div>
						<div className="flex w-1/4 flex-col">
							<Typography>Number</Typography>
							<Input
								type="number"
								name="streetNumber"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.streetNumber}
								className="mt-1"
							/>
						</div>
					</div>
					<div className="flex flex-row space-x-2">
						<div className="flex w-3/4 flex-col">
							<Typography>City</Typography>
							<Input
								type="text"
								name="city"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.city}
								className="mt-1"
							/>
						</div>
						<div className="flex w-1/4 flex-col">
							<Typography>ZIP code</Typography>
							<Input
								type="number"
								name="zip"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.zip}
								className="mt-1"
							/>
						</div>
					</div>
					<Button type="submit" color="primary" disabled={isSubmitting} className="md:col-span-2">
						Update
					</Button>
				</form>
			)}
		</Formik>
	);
}
