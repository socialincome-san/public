'use client';

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { useUserContext } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { useTranslator } from '@/hooks/useTranslator';
import { zodResolver } from '@hookform/resolvers/zod';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useFirestore } from 'reactfire';
import * as z from 'zod';

// TODO: i18n
export default function Page({ params }: DefaultPageProps) {
	const firestore = useFirestore();
	const { user, refetch } = useUserContext();
	const translator = useTranslator(params.lang, 'common');

	const formSchema = z.object({
		firstname: z.string(),
		lastname: z.string(),
		gender: z.enum(['male', 'female', 'other']),
		email: z.string().email(),
		street: z.string(),
		streetNumber: z.string(),
		city: z.string(),
		zip: z.coerce.number(),
		language: z.enum(['en', 'de']),
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
			language: undefined as any,
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
				language: user?.get('language') || '',
			});
		}
	}, [user, form]);

	const onSubmit = async (values: FormSchema) => {
		await updateDoc(doc(firestore, USER_FIRESTORE_PATH, user!.id), {
			personal: {
				name: values.firstname,
				lastname: values.lastname,
				gender: values.gender,
			},
			language: values.language,
			email: values.email,
			address: {
				street: values.street,
				number: values.streetNumber,
				city: values.city,
				zip: values.zip,
			},
		}).then(() => {
			toast.success('User updated');
			refetch();
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
							<Select onValueChange={field.onChange}>
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
				</div>
				<FormField
					control={form.control}
					name="language"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Language</FormLabel>
							<Select onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue>{field.value && translator?.t(`languages.${field.value}`)}</SelectValue>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="de">German</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button variant="outline" type="submit" className="md:col-span-2">
					Update
				</Button>
			</form>
		</Form>
	);
}
