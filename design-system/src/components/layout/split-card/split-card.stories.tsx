import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { AmountDisplay } from '../../data-display/amount-display/amount-display';
import { CheckList } from '../../data-display/check-list/check-list';
import { Separator } from '../../data-display/separator/separator';
import { AmountField } from '../../forms/amount-field/amount-field';
import { AmountSlider } from '../../forms/amount-slider/amount-slider';
import { SplitCard } from './split-card';

const meta = {
	title: 'Layout/Split Card',
	component: SplitCard,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A card with a main column and a muted aside, stacked on small screens. An optional footer strip sits below the card.',
			},
		},
	},
	args: {
		children: (
			<>
				<AmountSlider
					label="Your monthly income"
					currency="CHF"
					value={5900}
					formattedValue="5,900"
					min={1000}
					max={15000}
					onValueChange={() => undefined}
				/>
				<Separator label="Or choose your own amount" />
				<AmountField label="Custom amount (CHF)" value="" onChange={() => undefined} size="lg" inactive />
			</>
		),
		aside: (
			<>
				<AmountDisplay label="Your 1 %" currency="CHF" value="59" suffix="per month">
					CHF 708 in one year
				</AmountDisplay>
				<CheckList items={['1 person gets an income, 6 more benefit', 'Cancel anytime']} />
				<Button fullWidth>Donate CHF 59 monthly</Button>
			</>
		),
	},
} satisfies Meta<typeof SplitCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
	args: {
		footer: <span>Pay with Twint, card or QR bill</span>,
	},
};
