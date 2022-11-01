import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';

import { SoSelect, SoSelectProps, SO_SELECT_SIZES } from './Select';

export default {
	component: SoSelect,
	argTypes: {
		block: {
			defaultValue: false,
			description: 'If true, the control will be rendered with 100% width',
			control: { type: 'boolean' },
		},
		labelHidden: {
			defaultValue: false,
			description: 'If true, the label is only available to screenreaders, but visually hidden.',
			control: { type: 'boolean' },
		},
		size: {
			defaultValue: 'base',
			options: SO_SELECT_SIZES,
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof SoSelect>;

const Template: ComponentStory<typeof SoSelect> = (args: Partial<SoSelectProps>) => {
	const options: SoSelectProps['options'] = args?.options || [
		{
			label: 'Option 1',
		},
		{
			label: 'Option 2',
		},
		{
			label: 'Option 3',
		},
	];

	const [value, setValue] = useState(options[0]);

	const props: SoSelectProps = {
		label: 'Select Label',
		value,
		options,
		...args,
		onChange: (selectedItem) => {
			setValue(selectedItem);
		},
	};

	return <SoSelect {...props} />;
};

export const Standard: typeof Template = Template.bind({});
export const WithImages: typeof Template = Template.bind({});
WithImages.args = {
	label: 'Country Selector Example',
	options: [
		{
			label: 'Option 1',
			image: {
				src: 'ch.svg',
			},
		},
		{
			label: 'Option 2',
			image: {
				src: 'ch.svg',
			},
		},
		{
			label: 'Option 3',
			image: {
				src: 'ch.svg',
			},
		},
	],
};
