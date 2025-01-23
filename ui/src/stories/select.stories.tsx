import type { Meta, StoryObj } from '@storybook/react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '../components/select';

const meta = {
	title: 'Components/Select',
	component: Select,
	tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

// Basic Select
export const Basic: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select a fruit" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
					<SelectItem value="orange">Orange</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

// With Groups and Labels
export const WithGroupsAndLabels: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-[280px]">
				<SelectValue placeholder="Select a timezone" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>North America</SelectLabel>
					<SelectItem value="pst">Pacific Time (PST)</SelectItem>
					<SelectItem value="mst">Mountain Time (MST)</SelectItem>
					<SelectItem value="cst">Central Time (CST)</SelectItem>
					<SelectItem value="est">Eastern Time (EST)</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel>Europe</SelectLabel>
					<SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
					<SelectItem value="cet">Central European Time (CET)</SelectItem>
					<SelectItem value="eet">Eastern European Time (EET)</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

// Disabled State
export const DisabledState: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select an option" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="1">Option 1</SelectItem>
					<SelectItem value="2">Option 2</SelectItem>
					<SelectItem value="3">Option 3</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

// With Form
export const WithForm: Story = {
	render: () => (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				// Handle form submission
			}}
		>
			<div className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium">Preferred Language</label>
					<Select name="language">
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select a language" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="en">English</SelectItem>
							<SelectItem value="es">Spanish</SelectItem>
							<SelectItem value="fr">French</SelectItem>
							<SelectItem value="de">German</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
					Save Preference
				</button>
			</div>
		</form>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-[200px] border-blue-200 bg-blue-50">
				<SelectValue placeholder="Theme" />
			</SelectTrigger>
			<SelectContent className="bg-blue-50">
				<SelectGroup>
					<SelectItem value="light" className="hover:bg-blue-100">
						Light
					</SelectItem>
					<SelectItem value="dark" className="hover:bg-blue-100">
						Dark
					</SelectItem>
					<SelectItem value="system" className="hover:bg-blue-100">
						System
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

// With Error State
export const WithErrorState: Story = {
	render: () => (
		<div className="space-y-2">
			<Select>
				<SelectTrigger className="w-[200px] border-red-500 ring-red-500">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="1">Option 1</SelectItem>
						<SelectItem value="2">Option 2</SelectItem>
						<SelectItem value="3">Option 3</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<p className="text-sm text-red-500">Please select an option</p>
		</div>
	),
};
