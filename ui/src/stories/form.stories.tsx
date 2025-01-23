import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../components/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/form';
import { Input } from '../components/input';

const meta = {
	title: 'Components/Form',
	component: Form,
	tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof Form>;

// Form Schema
const formSchema = z.object({
	username: z.string().min(2, {
		message: 'Username must be at least 2 characters.',
	}),
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
});

// Basic Form
export const Basic: Story = {
	render: () => {
		const form = useForm<z.infer<typeof formSchema>>({
			resolver: zodResolver(formSchema),
			defaultValues: {
				username: '',
				email: '',
			},
		});

		function onSubmit(values: z.infer<typeof formSchema>) {
			console.log(values);
		}

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input placeholder="Enter username" {...field} />
								</FormControl>
								<FormDescription>This is your public display name.</FormDescription>
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
									<Input placeholder="Enter email" type="email" {...field} />
								</FormControl>
								<FormDescription>We'll never share your email with anyone else.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		);
	},
};

// Form with Validation
export const WithValidation: Story = {
	render: () => {
		const form = useForm<z.infer<typeof formSchema>>({
			resolver: zodResolver(formSchema),
			mode: 'onChange',
		});

		function onSubmit(values: z.infer<typeof formSchema>) {
			console.log(values);
		}

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input {...field} />
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
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		);
	},
};

// Form with Custom Styling
export const CustomStyled: Story = {
	render: () => {
		const form = useForm<z.infer<typeof formSchema>>();

		return (
			<Form {...form}>
				<form className="space-y-8">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem className="bg-secondary/10 rounded-lg border p-4">
								<FormLabel className="text-secondary">Username</FormLabel>
								<FormControl>
									<Input className="border-secondary" {...field} />
								</FormControl>
								<FormDescription className="text-secondary/70">Custom styled form field</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" variant="secondary">
						Submit
					</Button>
				</form>
			</Form>
		);
	},
};

// Form with Different States
export const DifferentStates: Story = {
	render: () => {
		const form = useForm();

		return (
			<div className="space-y-8">
				<Form {...form}>
					<FormField
						control={form.control}
						name="default"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Default State</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</Form>

				<Form {...form}>
					<FormField
						control={form.control}
						name="disabled"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Disabled State</FormLabel>
								<FormControl>
									<Input {...field} disabled />
								</FormControl>
							</FormItem>
						)}
					/>
				</Form>

				<Form {...form}>
					<FormField
						control={form.control}
						name="error"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Error State</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage>This is an error message</FormMessage>
							</FormItem>
						)}
					/>
				</Form>
			</div>
		);
	},
};
