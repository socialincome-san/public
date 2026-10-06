import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import { Button } from '../../actions/button/button';
import { Input } from '../input/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';

type ExampleValues = {
	email: string;
};

const FormExample = () => {
	const form = useForm<ExampleValues>({ defaultValues: { email: '' } });

	return (
		<Form {...form}>
			<form className="w-80 space-y-4" onSubmit={form.handleSubmit(() => undefined)}>
				<FormField
					control={form.control}
					name="email"
					rules={{ required: 'Email is required' }}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="you@example.com" type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Save</Button>
			</form>
		</Form>
	);
};

const meta = {
	title: 'Forms/Form',
	component: FormExample,
	tags: ['autodocs'],
} satisfies Meta<typeof FormExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
