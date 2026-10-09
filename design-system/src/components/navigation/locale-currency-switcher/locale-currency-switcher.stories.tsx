import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { LocaleCurrencySwitcher } from './locale-currency-switcher';

const meta = {
	title: 'Navigation/LocaleCurrencySwitcher',
	component: LocaleCurrencySwitcher,
	tags: ['autodocs'],
} satisfies Meta<typeof LocaleCurrencySwitcher>;

export default meta;

type Story = StoryObj<typeof LocaleCurrencySwitcher>;

const InteractiveSwitcher = ({ variant }: { variant?: 'ghost' | 'outline' }) => {
	const [open, setOpen] = useState(false);
	const [language, setLanguage] = useState('en');
	const [currency, setCurrency] = useState('USD');

	return (
		<LocaleCurrencySwitcher
			ariaLabel="Change language and currency"
			variant={variant}
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
		/>
	);
};

export const Ghost: Story = {
	render: () => <InteractiveSwitcher />,
};

export const Outline: Story = {
	render: () => <InteractiveSwitcher variant="outline" />,
};
