import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ChangeEvent, useState } from 'react';
import { SoTextField, SoTextFieldProps } from './TextField';

export default {
	component: SoTextField,
} as ComponentMeta<typeof SoTextField>;

const Template: ComponentStory<typeof SoTextField> = (
	args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>
) => {
	const [value, setValue] = useState(args.value ?? '');

	const props: SoTextFieldProps = {
		label: 'Text Field Label',
		...args,
		value,
		onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value),
	};

	return <SoTextField {...props} />;
};

export const Standard: typeof Template = Template.bind({});
Standard.args = {
	id: 'standard-text-field-example',
	label: 'Standard Text Field',
};

export const Prefilled: typeof Template = Template.bind({});
Prefilled.args = {
	id: 'standard-text-field-example',
	label: 'Standard Text Field',
	value: 'Hello World',
};

export const LabelHidden: typeof Template = Template.bind({});
LabelHidden.args = {
	id: 'label-hidden-text-field-example',
	labelHidden: true,
	value: 'Hello World',
};

export const OptionalLabelHidden: typeof Template = Template.bind({});
OptionalLabelHidden.args = {
	id: 'optional-label-hidden-field-example',
	label: 'Optional Label Hidden Field',
	optionalLabelHidden: true,
};

export const Info: typeof Template = Template.bind({});
Info.args = {
	id: 'info-text-field-example',
	help: 'Hilfestellung und Informationen',
};

export const WithIcon: typeof Template = Template.bind({});
WithIcon.args = {
	id: 'icon-text-field-example',
	iconLeft: <UserCircleIcon />,
};

export const Placeholder: typeof Template = Template.bind({});
Placeholder.args = {
	id: 'placeholder-text-field-example',
	label: 'Field with placeholder',
	placeholder: 'XXX-XXXX-X',
	help: 'Format: XXX-XXXX-X',
};

export const Required: typeof Template = Template.bind({});
Required.args = {
	id: 'required-text-field-example',
	required: true,
};

export const Invalid: typeof Template = Template.bind({});
Invalid.args = {
	id: 'invalid-text-field-example',
	error: true,
	help: 'Es ist ein Fehler aufgetreten',
};

export const Disabled: typeof Template = Template.bind({});
Disabled.args = {
	id: 'disabled-text-field-example',
	disabled: true,
	value: 'Text Field Value',
};

export const Multiline: typeof Template = Template.bind({});
Multiline.args = {
	id: 'multiline-text-field-example',
	multiline: true,
	block: true,
};
