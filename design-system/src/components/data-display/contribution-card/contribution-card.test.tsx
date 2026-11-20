/** @jest-environment jsdom */

import { act, type ComponentProps, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ContributionCard } from './contribution-card';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, ...props }: ComponentProps<'a'> & { children: ReactNode }) => <a {...props}>{children}</a>,
}));

const makeItems = (count: number) =>
	Array.from({ length: count }, (_, index) => ({ title: `Page ${index + 1}`, href: `/page-${index + 1}` }));

const setViewport = (isWide: boolean) => {
	Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: isWide }), configurable: true });
};

describe('ContributionCard', () => {
	let container: HTMLDivElement;
	let root: Root;

	const renderCard = (count: number) =>
		act(() =>
			root.render(
				<ContributionCard
					summary="Summary"
					items={makeItems(count)}
					showMoreLabel="Show {count} more"
					counterLabel="{shown} of {total}"
				/>,
			),
		);
	const rows = () => container.querySelectorAll('li');
	const button = () => container.querySelector('button');
	const clickShowMore = () => act(() => button()?.click());

	beforeEach(() => {
		container = document.createElement('div');
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	it('renders the first six rows and hides all but two of them on phones with CSS', () => {
		renderCard(30);

		expect(rows()).toHaveLength(6);
		expect([...rows()].map((row) => row.className.includes('max-sm:hidden'))).toEqual([
			false,
			false,
			true,
			true,
			true,
			true,
		]);
		expect(button()?.textContent).toBe('Show 6 moreShow 6 more');
		expect(button()?.nextElementSibling?.textContent).toBe('2 of 306 of 30');
	});

	it('reveals six more rows per click on a wide screen', () => {
		setViewport(true);
		renderCard(30);
		clickShowMore();

		expect(rows()).toHaveLength(12);
		expect([...rows()].some((row) => row.className.includes('max-sm:hidden'))).toBe(false);
		expect(button()?.textContent).toBe('Show 6 more');
		expect(button()?.nextElementSibling?.textContent).toBe('12 of 30');
	});

	it('counts on from two rows on a phone', () => {
		setViewport(false);
		renderCard(30);
		clickShowMore();

		expect(rows()).toHaveLength(8);
		expect(button()?.nextElementSibling?.textContent).toBe('8 of 30');
	});

	it('names the rows that are left when they are fewer than six, then moves the focus to the first new row', () => {
		setViewport(true);
		renderCard(8);

		expect(button()?.textContent).toContain('Show 2 more');

		clickShowMore();

		expect(rows()).toHaveLength(8);
		expect(button()).toBeNull();
		expect(document.activeElement?.getAttribute('href')).toBe('/page-7');
	});

	it('opens external items in a new tab and says so to screen readers', () => {
		act(() =>
			root.render(
				<ContributionCard
					summary="Summary"
					items={[
						{ title: 'Pull request', href: 'https://example.org/1', external: true },
						{ title: 'Page', href: '/page' },
					]}
					showMoreLabel="Show {count} more"
					counterLabel="{shown} of {total}"
					externalLinkLabel="Opens in a new tab"
				/>,
			),
		);
		const [external, internal] = container.querySelectorAll('a');

		expect(external.target).toBe('_blank');
		expect(external.rel).toBe('noopener noreferrer');
		expect(external.textContent).toContain('Opens in a new tab');
		expect(internal.target).toBe('');
		expect(internal.textContent).not.toContain('Opens in a new tab');
	});

	it('has no button for two items', () => {
		renderCard(2);

		expect(rows()).toHaveLength(2);
		expect(button()).toBeNull();
	});

	it('shows the button only on phones when a wide screen already shows every item', () => {
		renderCard(4);

		expect(button()?.parentElement?.className).toContain('sm:hidden');
		expect(button()?.textContent).toContain('Show 2 more');
	});
});
