import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { StepIndicator } from '../step-indicator/step-indicator';
import { WizardFooter } from './wizard-footer';

const meta = {
	title: 'Navigation/WizardFooter',
	component: WizardFooter,
	tags: ['autodocs'],
	args: {
		back: <Button variant="outline">Back</Button>,
		primary: <Button>Continue</Button>,
		progress: <StepIndicator steps={[{}, {}, {}, {}]} activeIndex={1} />,
	},
	parameters: {
		docs: {
			description: {
				component: 'The navigation at the bottom of a wizard step: back, progress and the primary action.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[40rem]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof WizardFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PrimaryOnly: Story = {
	args: { back: undefined, progress: undefined, primary: <Button>Done</Button> },
};
