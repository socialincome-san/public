import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Badge } from '../../data-display/badge/badge';
import { RadioCard, RadioCardGroup } from './radio-card';

const meta = {
	title: 'Forms/RadioCard',
	component: RadioCardGroup,
	tags: ['autodocs'],
} satisfies Meta<typeof RadioCardGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const RadioCardExample = ({ layout }: { layout: 'stack' | 'grid' | 'wrap' }) => {
	const [value, setValue] = useState('monthly');

	return (
		<div className="w-[480px]">
			<RadioCardGroup value={value} onChange={setValue} layout={layout}>
				<RadioCard
					value="monthly"
					checked={value === 'monthly'}
					label="Monthly"
					description="Paid out every month"
					badge={<Badge variant="verified">Recommended</Badge>}
				/>
				<RadioCard value="quarterly" checked={value === 'quarterly'} label="Quarterly" description="Every three months">
					<p className="text-sm">Extra content shows when selected.</p>
				</RadioCard>
				<RadioCard value="yearly" checked={value === 'yearly'} label="Yearly" disabled />
			</RadioCardGroup>
		</div>
	);
};

export const Stack: Story = {
	args: { onChange: () => undefined, children: null },
	render: () => <RadioCardExample layout="stack" />,
};

export const Grid: Story = {
	args: { onChange: () => undefined, children: null },
	render: () => <RadioCardExample layout="grid" />,
};
