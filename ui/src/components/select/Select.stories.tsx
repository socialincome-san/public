import { Meta, StoryFn } from '@storybook/react';
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
} as Meta<typeof SoSelect>;

const Template: StoryFn<typeof SoSelect> = (args: Partial<SoSelectProps>) => {
	const options: SoSelectProps['options'] = args?.options || {
		'option-1': {
			label: 'Option 1',
			value: 'option-1',
		},
		'option-2': {
			label: 'Option 2',
			value: 'option-2',
		},
		'option-3': {
			label: 'Option 3',
			value: 'option-3',
		},
	};

	const [value, setValue] = useState('option-1');

	const props: SoSelectProps = {
		label: 'Select Label',
		selected: value,
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
	options: {
		'option-1': {
			label: 'Option 1',
			value: 'option-1',
			image: {
				src: 'ch.svg',
			},
		},
		'option-2': {
			label: 'Option 2',
			value: 'option-2',
			image: {
				src: 'ch.svg',
			},
		},
		'option-3': {
			label: 'Option 3',
			value: 'option-3',
			image: {
				src: 'ch.svg',
			},
		},
	},
};
