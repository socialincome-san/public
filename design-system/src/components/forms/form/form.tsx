'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';
import { type WithoutClassName } from '../../../without-class-name';
import { Label } from '../label/label';

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>');
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const formItemVariants = cva('flex', {
	variants: {
		layout: {
			// Label above the control
			stack: 'flex-col gap-2',
			// Label next to the control, e.g. for switches
			inline: 'flex-row items-center gap-2',
			// Takes the remaining height of a flex column so its content can scroll
			fill: 'min-h-0 flex-1 flex-col',
		},
	},
	defaultVariants: {
		layout: 'stack',
	},
});

const FormItem = React.forwardRef<
	HTMLDivElement,
	WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & VariantProps<typeof formItemVariants>
>(({ layout, ...props }, ref) => {
	const id = React.useId();
	const { name } = useFormField();
	const testId = `form-item-${name}`;

	return (
		<FormItemContext.Provider value={{ id }}>
			<div data-testid={testId} ref={ref} className={formItemVariants({ layout })} {...props} />
		</FormItemContext.Provider>
	);
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>
>((props, ref) => {
	const { error, formItemId } = useFormField();

	return <Label ref={ref} invalid={Boolean(error)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof Slot>>
>(({ ...props }, ref) => {
	const { error, formItemId, formMessageId } = useFormField();

	return (
		<Slot ref={ref} id={formItemId} aria-describedby={error ? formMessageId : undefined} aria-invalid={!!error} {...props} />
	);
});
FormControl.displayName = 'FormControl';

const FormMessage = React.forwardRef<HTMLParagraphElement, WithoutClassName<React.HTMLAttributes<HTMLParagraphElement>>>(
	({ children, ...props }, ref) => {
		const { error, formMessageId } = useFormField();
		const body = error ? String(error?.message) : children;

		if (!body) {
			return null;
		}

		return (
			<p
				ref={ref}
				id={formMessageId}
				className="text-destructive-foreground bg-destructive ml-1 rounded px-2 py-1 text-sm font-medium"
				{...props}
			>
				{body}
			</p>
		);
	},
);
FormMessage.displayName = 'FormMessage';

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
