import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';

import { SoCombobox, SoComboboxProps, SO_COMBOBOX_SIZES } from './Combobox';

export default {
	component: SoCombobox,
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
			options: SO_COMBOBOX_SIZES,
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof SoCombobox>;

const Template: ComponentStory<typeof SoCombobox> = (args: Partial<SoComboboxProps>) => {
	const options: SoComboboxProps['options'] = args?.options || [
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

	const props: SoComboboxProps = {
		label: 'Select Label',
		value,
		options,
		...args,
		onChange: (selectedItem) => {
			setValue(selectedItem);
		},
	};

	return <SoCombobox {...props} />;
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
