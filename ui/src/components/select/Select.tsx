import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

type ListboxProps = Parameters<typeof Listbox>[0];

export const SO_SELECT_SIZES = ['base', 'xl'];

export type SoSelectItem = {
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

export interface SoSelectProps extends Pick<ListboxProps, 'onChange' | 'name' | 'disabled' | 'value'> {
	/**
	 * The select's label elements
	 */
	label: string;

	/**
	 * Options available for selection
	 */
	options: SoSelectItem[];

	/**
	 * The selected/current value
	 */
	value: SoSelectItem;

	/**
	 * Emits the selected value on change
	 */
	onChange?(value: SoSelectItem): void;

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
	size?: typeof SO_SELECT_SIZES[number];
}

/**
 * @see https://headlessui.com/react/listbox
 */
export const SoSelect = ({
	label,
	options,
	name,
	size = 'base',
	value = options[0],
	block = false,
	labelHidden = false,
	...props
}: SoSelectProps) => {
	return (
		<Listbox {...props}>
			{({ open }) => (
				<>
					<Listbox.Label className={classNames('block', 'font-medium', 'text-gray-700', { 'sr-only': labelHidden })}>
						{label}
					</Listbox.Label>
					<div className="relative mt-1">
						<Listbox.Button
							className={classNames(
								'relative',
								'cursor-default',
								'rounded-lg',
								'border',
								'border-gray-300',
								'bg-white',
								'p-3',
								'pl-3',
								'pr-10',
								'text-left',
								'transition',
								'hover:shadow-lg',
								'hover:shadow-gray-200',
								`text-${size}`,
								{ 'w-full': block }
							)}
						>
							<span className="flex items-center">
								{value?.image && (
									<img src={value.image.src} alt="" className="h-6 w-6 flex-shrink-0 rounded-full object-cover" />
								)}
								<span className={classNames({ 'ml-3': value.image }, 'block', 'truncate')}>{value.label}</span>
							</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pr-2">
								<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options
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
								{options.map((option, i) => (
									<Listbox.Option
										key={i}
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
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};
