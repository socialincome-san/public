import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { Fragment, useState } from 'react';

type ComboboxProps = Parameters<typeof Combobox>[0];

export const SO_COMBOBOX_SIZES = ['base', 'xl'] as const;

export type SoComboboxItem = {
	/**
	 * The visible text
	 */
	label: string;

	/**
	 * An optional image
	 */
	image?: {
		src: string;
	};
};

export interface SoComboboxProps extends Pick<ComboboxProps, 'name' | 'disabled'> {
	/**
	 * The select's label elements
	 */
	label: string;

	/**
	 * Options available for selection
	 */
	options: SoComboboxItem[];

	/**
	 * The selected/current value
	 */
	value: SoComboboxItem;

	/**
	 * Emits the selected value on change
	 */
	onChange?(value: SoComboboxItem): void;

	/**
	 * If true, the options get visible when the user focuses the text field
	 */
	openOnFocus?: boolean;

	/**
	 * Render full width
	 */
	block?: boolean;

	/**
	 * If true, the label is visually hidden. It will still be available to screenreaders.
	 */
	labelHidden?: boolean;

	/**
	 * Visual size of the button
	 */
	size?: typeof SO_COMBOBOX_SIZES[number];
}

/**
 * Comboboxes are the foundation of accessible autocompletes and command palettes, complete with robust support for keyboard navigation.
 * Use the `SoCombobox` instead of the `SoSelect` whenever you have more than only a couple of options. The Combobox allows a more fine
 * grained search over all options compared to the select.
 * @see https://headlessui.com/react/combobox
 */
export const SoCombobox = ({
	label,
	options,
	name,
	size = 'base',
	value = options[0],
	openOnFocus = true,
	block = false,
	labelHidden = false,
	...props
}: SoComboboxProps) => {
	const [query, setQuery] = useState('');

	const filteredOptions =
		query === ''
			? options
			: options.filter((option) => {
					return option.label.toLowerCase().includes(query.toLowerCase());
			  });

	/**
	 * Handles user input in the text field
	 */
	const inputChange = (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);
	const inputDisplayValue = (option: SoComboboxItem) => option?.label || value.label;

	return (
		<Combobox {...props}>
			{({ open }) => (
				<>
					<Combobox.Label
						className={classNames('block', 'font-medium', 'text-gray-700', 'mb-1', { 'sr-only': labelHidden })}
					>
						{label}
					</Combobox.Label>
					<div
						className={classNames(
							'relative',
							'cursor-default',
							'rounded-lg',
							'border',
							'inline-flex',
							'items-center',
							'border-gray-300',
							'bg-white',
							'text-left',
							'transition',
							'hover:shadow-lg',
							'hover:shadow-gray-200',
							`text-${size}`,
							{ 'w-full': block }
						)}
					>
						{value?.image && (
							<img src={value.image.src} alt="" className="ml-3 h-6 w-6 flex-shrink-0 rounded-full object-cover" />
						)}
						<Combobox.Input
							className={classNames(
								'border-none',
								'p-3',
								'pl-3',
								'pr-10',
								'bg-transparent',
								'text-gray-900',
								'focus:ring-0',
								`text-${size}`,
								{
									'w-full': block,
								}
							)}
							displayValue={inputDisplayValue}
							onChange={inputChange}
						/>
						<Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
						</Combobox.Button>
					</div>
					<Transition
						show={open}
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
						afterLeave={() => setQuery('')}
					>
						<Combobox.Options
							static
							className={classNames(
								'absolute',
								'z-10',
								'mt-1',
								'max-h-56',
								'overflow-auto',
								'rounded-lg',
								'bg-white',
								'py-1',
								'shadow-lg',
								'ring-1',
								'ring-black',
								'ring-opacity-5',
								'focus:outline-none',
								`text-${size}`,
								{ 'w-full': block }
							)}
						>
							{filteredOptions.length === 0 && query !== '' ? (
								<div className="relative cursor-default select-none py-2 px-4 text-gray-700">Nothing found.</div>
							) : (
								filteredOptions.map((option) => (
									<Combobox.Option
										key={option.label}
										className={({ active }) =>
											classNames(
												active ? 'text-white bg-so-color-accent-2-primary-500' : 'text-gray-900',
												'relative cursor-default select-none py-2 pl-3 pr-12'
											)
										}
										value={option}
									>
										{({ selected, active }) => (
											<>
												<div className="flex items-center">
													{option?.image && (
														<img
															src={option.image.src}
															alt=""
															className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
														/>
													)}
													<span
														className={classNames(active ? 'font-semibold' : 'font-normal', 'truncate', {
															'ml-3': value.image,
														})}
													>
														{option.label}
													</span>
												</div>

												{selected && (
													<span className={classNames('absolute inset-y-0 right-0 flex items-center pr-4')}>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												)}
											</>
										)}
									</Combobox.Option>
								))
							)}
						</Combobox.Options>
					</Transition>
				</>
			)}
		</Combobox>
	);
};
