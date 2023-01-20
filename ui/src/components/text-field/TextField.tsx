import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

export const SO_TEXT_FIELD_SIZES = ['base', 'xl'] as const;

export type SoTextFieldProps = SoSinglelineTextFieldProps | SoMultilineTextFieldProps;

type SoSinglelineTextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & SoBaseTextFieldProps;
type SoMultilineTextFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & SoBaseTextFieldProps;

interface SoBaseTextFieldProps {
	/**
	 * An ID unique to this field when rendered on the same page as other fields
	 */
	id: string; // Make required

	/**
	 * Text label for the field
	 */
	label: string;

	/**
	 * Modifier classes for the input field
	 */
	inputClassName?: string;

	/**
	 * Modifier classes for the label
	 */
	labelClassName?: string;

	/**
	 * If true, makes the label only available to screen readers.
	 * Use with caution as it has usability/accessibility drawbacks
	 * for users.
	 */
	labelHidden?: boolean;

	/**
	 * Field is invalid
	 */
	error?: boolean;

	/**
	 * Display validation message or help
	 */
	help?: string;

	/**
	 * Optional icon rendered on the left of the text field
	 */
	iconLeft?: React.ReactNode;

	/**
	 * Visual size of the text field
	 */
	size?: typeof SO_TEXT_FIELD_SIZES[number];

	/**
	 * Render full width
	 */
	block?: boolean;

	/**
	 * If true, the "optional" label is hidden even when the field is not "required".
	 * That's useful for single form fields not belonging to a long-form.
	 * In long-forms, it's better to only mark the optional ones and assume the rest
	 * is required and therefore, not mark 'required' fields when the majority of them are.
	 */
	optionalLabelHidden?: boolean;

	/**
	 * If true, is rendered as a HTMLTextAreaElement
	 */
	multiline?: boolean;
}

/**
 * Social Income component to render HTMLInputElement and HTMLTextAreaElement, used for any type of single and multiline fields.
 */
export const SoTextField = (props: SoTextFieldProps) => {
	const {
		id,
		label,
		className = '',
		inputClassName = '',
		labelClassName = '',
		labelHidden,
		optionalLabelHidden,
		value = '',
		size = 'base',
		block,
		error,
		help,
		iconLeft,
		multiline,
		...inputProps
	} = props;
	const ariaInvalid = error;
	const ariaDescribedBy = ariaInvalid ? `${id}-helper-text` : null;

	const fieldWrapperClasses = classNames(
		{
			'inline-block': !block,
		},
		className
	);

	const labelClasses = classNames(
		'inline-flex',
		'gap-1',
		'font-medium',
		'text-gray-700',
		'mb-1',
		{ 'sr-only': labelHidden },
		labelClassName
	);

	const inputWrapperClasses = classNames('relative', 'flex-col', {
		'inline-flex': !block,
		flex: block,
		'w-full': block,
	});

	const inputClasses = classNames(
		'relative',
		'rounded-lg',
		'border',
		'border-gray-300',
		'bg-white',
		'p-3',
		'pl-3',
		'pr-10',
		'text-left',
		'transition',
		`text-${size}`,
		{ 'pl-10': iconLeft },
		{ 'text-gray-900': !props?.disabled },
		{ 'text-gray-600': props?.disabled },
		{ 'hover:shadow-lg': !props?.disabled, 'hover:shadow-gray-200': !props?.disabled },
		{ 'w-full': block },
		{ 'bg-gray-100': props?.disabled },
		inputClassName
	);

	const helpClasses = classNames('mt-1', {
		'text-red-600': ariaInvalid,
		'text-gray-600': !ariaInvalid,
	});

	const labelElement = (
		<label htmlFor={id} className={labelClasses}>
			{label}
			{!props?.required && !optionalLabelHidden && (
				<span className={classNames('text-gray-500')} aria-hidden="true">
					(optional)
				</span>
			)}
		</label>
	);

	const helpElement = (
		<p id={ariaDescribedBy} className={helpClasses}>
			{help}
		</p>
	);

	return (
		<div className={fieldWrapperClasses} data-testid="so-text-field">
			<div className={inputWrapperClasses}>
				{labelElement}
				{iconLeft && (
					<span aria-hidden="true" className="w-6 h-6 inline-block absolute left-2 top-10 z-10 text-gray-500">
						{iconLeft}
					</span>
				)}

				{isMultilineTextField(props) ? (
					<textarea
						id={id}
						className={inputClasses}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						aria-errormessage={ariaDescribedBy}
						{...props}
					>
						{value}
					</textarea>
				) : (
					<input
						id={id}
						className={inputClasses}
						value={value}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						aria-errormessage={ariaDescribedBy}
						{...props}
					/>
				)}

				{ariaInvalid && <ExclamationCircleIcon className="absolute bottom-3 right-2 w-6 h-6 text-red-600" />}
			</div>
			{help && helpElement}
		</div>
	);
};

function isMultilineTextField(
	object: SoSinglelineTextFieldProps | SoMultilineTextFieldProps
): object is SoMultilineTextFieldProps {
	return object.multiline;
}
