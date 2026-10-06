import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '../avatar/avatar';

import { Card } from './card';

const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A surface for grouping content.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=46-65&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
	argTypes: {
		children: {
			control: 'text',
		},
		padding: {
			control: 'select',
			options: ['default', 'compact', 'none'],
		},
		elevation: {
			control: 'select',
			options: ['raised', 'flat'],
		},
		surface: {
			control: 'select',
			options: ['default', 'gradient'],
		},
		interactive: {
			control: 'boolean',
		},
	},
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: 'Test',
	},
};

export const Variants: Story = {
	render: () => (
		<div className="flex items-stretch gap-6">
			<Card>Default</Card>
			<Card padding="compact" elevation="flat">
				Compact and flat
			</Card>
			<Card padding="compact" surface="gradient">
				Gradient
			</Card>
			<Card padding="none">
				<div className="p-10">No padding</div>
			</Card>
		</div>
	),
};

export const WithContent: Story = {
	args: {
		children: (
			<div className="flex items-center gap-6">
				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-semibold">Debt instead of opportunity? Why we don&apos;t offer microloans.</h2>
					<div className="flex items-center gap-2">
						<Avatar>
							<AvatarFallback>SS</AvatarFallback>
						</Avatar>
						<span className="font-semibold text-slate-800">Sandino Scheidegger</span>
					</div>
				</div>

				<Image
					src="https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/alligator-crocodile.jpg/m/640x524/filters:focal(380x1154:381x1155):format(webp)"
					alt="Alligator"
					width={300}
					height={200}
					className="rounded-2xl object-cover"
				/>
			</div>
		),
	},
};
