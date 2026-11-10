import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Button } from '../../actions/button/button';
import { ResultSummary } from '../../data-display/result-summary/result-summary';
import { AmountSlider } from '../../forms/amount-slider/amount-slider';
import { SplitCard } from './split-card';

const meta = {
	title: 'Layout/SplitCard',
	component: SplitCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A card with the input on the left and a summary on a muted surface on the right, stacked on small screens. Optional footer row below the card.',
			},
		},
	},
} satisfies Meta<typeof SplitCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Calculator: Story = {
	args: {
		children: (
			<AmountSlider
				label="Your monthly income"
				currency="CHF"
				value={5930}
				formattedValue="5’930"
				min={1000}
				max={15000}
				onValueChange={fn()}
			/>
		),
		aside: (
			<>
				<ResultSummary label="Your 1%" value="CHF 59" suffix="/ month" />
				<Button fullWidth>Donate CHF 59 per month</Button>
			</>
		),
		footer: <span>Join 132 supporters from 30 countries</span>,
	},
};
