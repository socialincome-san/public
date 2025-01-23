import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/card';

const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Card
export const Basic: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
		</Card>
	),
};

// Card with Footer
export const WithFooter: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Newsletter</CardTitle>
				<CardDescription>Get updates on our latest features.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Subscribe to our newsletter to stay updated with our latest news and features.</p>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="ghost">Cancel</Button>
				<Button>Subscribe</Button>
			</CardFooter>
		</Card>
	),
};

// Interactive Card
export const Interactive: Story = {
	render: () => (
		<Card className="w-[350px] cursor-pointer transition-shadow hover:shadow-lg">
			<CardHeader>
				<CardTitle>Interactive Card</CardTitle>
				<CardDescription>This card has hover and click effects</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Click or hover over this card to see the effects.</p>
			</CardContent>
		</Card>
	),
};

// Custom Styled Card
export const CustomStyled: Story = {
	render: () => (
		<Card className="bg-primary text-primary-foreground w-[350px]">
			<CardHeader>
				<CardTitle className="text-primary-foreground">Custom Theme</CardTitle>
				<CardDescription className="text-primary-foreground/80">Custom styled card with primary theme</CardDescription>
			</CardHeader>
			<CardContent>
				<p>This card uses custom background and text colors.</p>
			</CardContent>
			<CardFooter>
				<Button variant="secondary">Action</Button>
			</CardFooter>
		</Card>
	),
};

// Multiple Cards Layout
export const GridLayout: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Card 1</CardTitle>
				</CardHeader>
				<CardContent>Content 1</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Card 2</CardTitle>
				</CardHeader>
				<CardContent>Content 2</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Card 3</CardTitle>
				</CardHeader>
				<CardContent>Content 3</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Card 4</CardTitle>
				</CardHeader>
				<CardContent>Content 4</CardContent>
			</Card>
		</div>
	),
};
