/** @jest-environment jsdom */

import {
	CountriesSectionClient,
	type CountriesSectionClientProps,
} from '@/components/transparency/countries-section-client';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ alt, src }: { alt: string; src: string }) => <span data-image-src={src} data-image-alt={alt} />,
}));

const baseProps: CountriesSectionClientProps = {
	sectionTitle: 'Inflows',
	headlineTemplate: '{{amount}} donations arrived from {{countriesCount}} countries',
	headlineCountryTemplate: '{{amount}} donations arrived from {{country}}',
	headlineOtherTemplate: '{{amount}} donations arrived from other countries',
	otherCountriesLabel: 'Other countries',
	emptyLabel: 'No donations from any country in this period.',
	chartAriaLabel: 'Donation amounts by country of origin',
	dialogTitle: 'Other countries',
	formattedTotalAmount: 'CHF 100',
	formattedCountriesCount: '3',
	segments: [
		{
			id: 'CH',
			countryCode: 'CH',
			countryName: 'Switzerland',
			formattedAmount: 'CHF 80',
			formattedPercentage: '80%',
			unitCount: 80,
			color: 'red',
			rowAriaLabel: 'Switzerland, CHF 80, 80%',
		},
		{
			id: 'DE',
			countryCode: 'DE',
			countryName: 'Germany',
			formattedAmount: 'CHF 15',
			formattedPercentage: '15%',
			unitCount: 15,
			color: 'blue',
			rowAriaLabel: 'Germany, CHF 15, 15%',
		},
		{
			id: 'OTHER',
			countryCode: null,
			countryName: 'Other countries',
			formattedAmount: 'CHF 5',
			formattedPercentage: '5%',
			unitCount: 5,
			color: 'gray',
			rowAriaLabel: 'Other countries, CHF 5, 5%',
		},
	],
	otherCountries: [{ countryCode: 'US', countryName: 'United States', formattedAmount: 'CHF 5' }],
};

describe('CountriesSectionClient', () => {
	test('server-renders the headline, 100 unit bars, and legend without a loading state', () => {
		const markup = renderToStaticMarkup(<CountriesSectionClient {...baseProps} />);

		expect(markup).toContain('Inflows');
		expect(markup).toContain('CHF 100');
		expect(markup).toContain('donations arrived from');
		expect(markup).toContain('>3<');
		expect(markup).toContain('aria-label="Donation amounts by country of origin"');
		expect((markup.match(/w-0\.5 rounded-full/g) ?? []).length).toBe(100);
		expect(markup).toContain('--legend-rows:2');
		expect(markup).toContain('Switzerland');
		expect(markup).toContain('Other countries');
		expect(markup).not.toContain('No donations from any country');
	});

	test('renders an empty state instead of the chart when there are no segments', () => {
		const markup = renderToStaticMarkup(
			<CountriesSectionClient
				{...baseProps}
				segments={[]}
				otherCountries={[]}
				formattedCountriesCount="0"
				formattedTotalAmount="CHF 0"
			/>,
		);

		expect(markup).toContain('No donations from any country in this period.');
		expect(markup).not.toContain('aria-label="Donation amounts by country of origin"');
	});

	test('updates the headline on keyboard focus and opens the other-countries dialog', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);

		act(() => {
			root.render(<CountriesSectionClient {...baseProps} />);
		});

		const switzerlandButton = container.querySelector<HTMLButtonElement>('button[aria-label="Switzerland, CHF 80, 80%"]');
		expect(switzerlandButton).not.toBeNull();

		act(() => {
			switzerlandButton?.focus();
		});

		expect(container.querySelector('h2')?.textContent).toContain('CHF 80');
		expect(container.querySelector('h2')?.textContent).toContain('Switzerland');

		const germanyButton = container.querySelector<HTMLButtonElement>('button[aria-label="Germany, CHF 15, 15%"]');
		expect(germanyButton).not.toBeNull();

		act(() => {
			germanyButton?.focus();
		});

		expect(container.querySelector('h2')?.textContent).toContain('CHF 15');
		expect(container.querySelector('h2')?.textContent).toContain('Germany');
		expect(container.querySelector('h2')?.textContent).not.toContain('3 countries');

		const otherButton = container.querySelector<HTMLButtonElement>('button[aria-label="Other countries, CHF 5, 5%"]');
		expect(otherButton).not.toBeNull();

		act(() => {
			otherButton?.click();
		});

		expect(document.body.textContent).toContain('United States');

		act(() => {
			root.unmount();
		});
		container.remove();
	});
});
