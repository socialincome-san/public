import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../components/label';
import { RadioGroup, RadioGroupItem } from '../components/radio-group';

const meta = {
	title: 'Components/RadioGroup',
	component: RadioGroup,
	tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// Basic Radio Group
export const Basic: Story = {
	render: () => (
		<RadioGroup defaultValue="option-1">
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-1" id="option-1" />
				<Label htmlFor="option-1">Option 1</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-2" id="option-2" />
				<Label htmlFor="option-2">Option 2</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-3" id="option-3" />
				<Label htmlFor="option-3">Option 3</Label>
			</div>
		</RadioGroup>
	),
};

// With Description
export const WithDescription: Story = {
	render: () => (
		<RadioGroup defaultValue="comfortable">
			<div className="flex items-start space-x-2">
				<RadioGroupItem value="default" id="default" className="mt-1" />
				<div>
					<Label htmlFor="default">Default</Label>
					<p className="text-muted-foreground text-sm">System default spacing for controls and content.</p>
				</div>
			</div>
			<div className="flex items-start space-x-2">
				<RadioGroupItem value="comfortable" id="comfortable" className="mt-1" />
				<div>
					<Label htmlFor="comfortable">Comfortable</Label>
					<p className="text-muted-foreground text-sm">Additional spacing for better readability.</p>
				</div>
			</div>
			<div className="flex items-start space-x-2">
				<RadioGroupItem value="compact" id="compact" className="mt-1" />
				<div>
					<Label htmlFor="compact">Compact</Label>
					<p className="text-muted-foreground text-sm">Reduced spacing to show more content.</p>
				</div>
			</div>
		</RadioGroup>
	),
};

// Disabled State
export const DisabledState: Story = {
	render: () => (
		<RadioGroup defaultValue="option-2">
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-1" id="disabled-1" disabled />
				<Label htmlFor="disabled-1" className="text-muted-foreground">
					Disabled Option
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-2" id="disabled-2" />
				<Label htmlFor="disabled-2">Enabled Option</Label>
			</div>
		</RadioGroup>
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
					<h4 className="mb-3 text-sm font-medium">Notification Preferences</h4>
					<RadioGroup defaultValue="all">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="notify-all" />
							<Label htmlFor="notify-all">All notifications</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="important" id="notify-important" />
							<Label htmlFor="notify-important">Important only</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="none" id="notify-none" />
							<Label htmlFor="notify-none">None</Label>
						</div>
					</RadioGroup>
				</div>
				<button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
					Save Preferences
				</button>
			</div>
		</form>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<RadioGroup defaultValue="option-1" className="bg-muted rounded-lg p-4">
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-1" id="custom-1" className="border-blue-500 text-blue-500" />
				<Label htmlFor="custom-1" className="text-blue-500">
					Blue Option
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="option-2" id="custom-2" className="border-green-500 text-green-500" />
				<Label htmlFor="custom-2" className="text-green-500">
					Green Option
				</Label>
			</div>
		</RadioGroup>
	),
};
