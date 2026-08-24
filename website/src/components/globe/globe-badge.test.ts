/** @jest-environment jsdom */

import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { createBadgeSlotElement, mountBadgeContent } from './globe-badge';

const makeContribution = (overrides: Partial<GlobeContribution> = {}): GlobeContribution => ({
	key: 'cid-test',
	amount: 42,
	currency: 'CHF',
	contributedAt: '2026-08-10T14:32:00.000Z',
	countryCode: 'CH',
	countryName: 'Switzerland',
	...overrides,
});

const renderBadge = (contribution: GlobeContribution) => {
	const slot = createBadgeSlotElement();
	mountBadgeContent(slot, contribution, 'en-US');

	return slot;
};

describe('globe badge', () => {
	it('creates a badge element', () => {
		expect(renderBadge(makeContribution())).toBeInstanceOf(HTMLElement);
	});

	it('displays the country name', () => {
		const element = renderBadge(makeContribution({ countryName: 'Switzerland' }));
		expect(element.textContent).toContain('Switzerland');
	});

	it('applies uppercase styling to the country name', () => {
		const element = renderBadge(makeContribution({ countryName: 'Germany' }));
		const label = element.querySelector('[data-globe-badge] > span > span');
		expect(label?.textContent).toBe('Germany');
		expect(label?.className).toContain('uppercase');
	});

	it('renders a circular 14x14 country flag after the country name', () => {
		const element = renderBadge(makeContribution({ countryCode: 'CH', countryName: 'Switzerland' }));
		const countryRow = element.querySelector('[data-globe-badge] > span');
		const [name, flag] = [...(countryRow?.children ?? [])];

		expect(name?.textContent).toBe('Switzerland');
		expect(flag).toBeInstanceOf(HTMLImageElement);
		expect(flag?.getAttribute('src')).toBe('/assets/flags/ch.svg');
		expect(flag?.getAttribute('width')).toBe('14');
		expect(flag?.getAttribute('height')).toBe('14');
		expect(flag?.className).toContain('rounded-full');
		expect(flag?.className).toContain('size-[14px]');
	});

	it('displays the formatted amount', () => {
		const element = renderBadge(makeContribution({ amount: 100, currency: 'USD' }));
		expect(element.textContent).toContain('100');
	});

	it('displays the contribution date', () => {
		const element = renderBadge(makeContribution({ contributedAt: '2026-08-10T14:32:00.000Z' }));
		expect(element.textContent).toMatch(/aug|10/i);
	});

	it('marks the root element as pointer-events-none', () => {
		const element = renderBadge(makeContribution());
		expect(element.className).toContain('pointer-events-none');
	});

	it('applies the badge animation class', () => {
		const element = renderBadge(makeContribution());
		expect(element.className).toContain('animate-globe-badge');
	});

	it('offsets the badge upward from its anchor', () => {
		const element = renderBadge(makeContribution());
		expect(element.style.transform).toBe('translateY(-10px)');
	});

	it('uses textContent — not innerHTML — for country name', () => {
		const contribution = makeContribution({ countryName: '<script>alert(1)</script>' });
		const element = renderBadge(contribution);
		expect(element.innerHTML).not.toContain('<script>');
		expect(element.textContent).toContain('<script>alert(1)</script>');
	});
});
