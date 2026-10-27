import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
import { LocaleCurrencySwitcher } from './locale-currency-switcher';

const meta = {
	title: 'Navigation/LocaleCurrencySwitcher',
	component: LocaleCurrencySwitcher,
	tags: ['autodocs'],
} satisfies Meta<typeof LocaleCurrencySwitcher>;

export default meta;

type Story = StoryObj<typeof LocaleCurrencySwitcher>;

const countries = [
	{ value: 'auto', label: 'Automatic' },
	{ value: 'CH', label: 'Switzerland' },
	{ value: 'DE', label: 'Germany' },
	{ value: 'SL', label: 'Sierra Leone' },
];

const countryCurrencies: Record<string, string> = { CH: 'CHF', DE: 'EUR' };

type InteractiveSwitcherProps = {
	variant?: 'ghost' | 'outline';
	withCountry?: boolean;
	hideCountryCurrency?: boolean;
};

const InteractiveSwitcher = ({ variant, withCountry, hideCountryCurrency }: InteractiveSwitcherProps) => {
	const [open, setOpen] = useState(false);
	const [language, setLanguage] = useState('en');
	const [currency, setCurrency] = useState('USD');
	const [country, setCountry] = useState('CH');
	const isCountryCurrency = countryCurrencies[country] === currency;

	return (
		<LocaleCurrencySwitcher
			ariaLabel="Change language and currency"
			variant={variant}
			icon={withCountry && country !== 'auto' ? <CountryFlag country={country} size="sm" decorative /> : undefined}
			triggerLabel={hideCountryCurrency && isCountryCurrency ? language.toUpperCase() : undefined}
			open={open}
			onOpenChange={setOpen}
			language={{
				label: 'Language',
				value: language,
				options: ['en', 'de', 'fr', 'it'].map((value) => ({ value, label: value.toUpperCase() })),
				onChange: setLanguage,
			}}
			currency={{
				label: 'Currency',
				value: currency,
				options: ['CHF', 'EUR', 'USD'].map((value) => ({ value, label: value })),
				onChange: setCurrency,
			}}
			country={
				withCountry
					? {
							label: 'Country',
							value: country,
							options: countries,
							onChange: setCountry,
							searchPlaceholder: 'Search country',
							emptyLabel: 'No country found.',
						}
					: undefined
			}
		/>
	);
};

export const Ghost: Story = {
	render: () => <InteractiveSwitcher />,
};

export const Outline: Story = {
	render: () => <InteractiveSwitcher variant="outline" />,
};

export const WithCountry: Story = {
	render: () => <InteractiveSwitcher withCountry />,
};

// The button leaves out the currency when it is the country's own, e.g. CHF in Switzerland.
export const HideCountryCurrency: Story = {
	render: () => <InteractiveSwitcher withCountry hideCountryCurrency />,
};
