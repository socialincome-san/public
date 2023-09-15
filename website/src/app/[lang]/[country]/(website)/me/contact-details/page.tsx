'use client';

import { UserContext } from '@/app/[lang]/[country]/(website)/me/user-context-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import { doc, updateDoc } from 'firebase/firestore';
import _ from 'lodash';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useFirestore } from 'reactfire';
import * as z from 'zod';

// TODO: i18n
export default function Page() {
	const firestore = useFirestore();
	const { user } = useContext(UserContext);

	const formSchema = z.object({
		firstname: z.string(),
		lastname: z.string(),
		gender: z.enum(['male', 'female', 'other']),
		email: z.string().email(),
		street: z.string(),
		streetNumber: z.string(),
		city: z.string(),
		zip: z.coerce.number(),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: '',
			lastname: '',
			gender: undefined as any,
			email: '',
			street: '',
			streetNumber: '',
			city: '',
			zip: '' as any,
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				firstname: user?.get('personal.name') || '',
				lastname: user?.get('personal.lastname') || '',
				gender: user?.get('personal.gender') || '',
				email: user?.get('email') || '',
				street: user?.get('address.street') || '',
				streetNumber: user?.get('address.number') || '',
				city: user?.get('address.city') || '',
				zip: user?.get('address.zip') || '',
			});
		}
	}, [user]);

	const onSubmit = async (values: FormSchema) => {
		console.log(values);
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

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="firstname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="First name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="Last name" {...field} />
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
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" placeholder="Email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gender</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue>{_.capitalize(field.value)}</SelectValue>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-row space-x-2">
					<FormField
						control={form.control}
						name="street"
						render={({ field }) => (
							<FormItem className="flex w-3/4 flex-col">
								<FormLabel>Street</FormLabel>
								<FormControl>
									<Input type="text" placeholder="street" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="streetNumber"
						render={({ field }) => (
							<FormItem className="flex w-1/4 flex-col">
								<FormLabel>Number</FormLabel>
								<FormControl>
									<Input type="text" placeholder="streetNumber" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex flex-row space-x-2">
					<FormField
						control={form.control}
						name="city"
						render={({ field }) => (
							<FormItem className="flex w-3/4 flex-col">
								<FormLabel>City</FormLabel>
								<FormControl>
									<Input type="text" placeholder="city" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="zip"
						render={({ field }) => (
							<FormItem className="flex w-1/4 flex-col">
								<FormLabel>Zip</FormLabel>
								<FormControl>
									<Input type="number" placeholder="zip" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<Button type="submit" className="md:col-span-2">
					Update
				</Button>
			</form>
		</Form>
	);
}
