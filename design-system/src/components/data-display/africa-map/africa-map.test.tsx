/** @jest-environment jsdom */

import { act, type ComponentProps, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AfricaMap } from './africa-map';
import { AFRICA_MAP_FRAME, AFRICA_MAP_SHAPES, AFRICA_MAP_ZOOM } from './africa-map-geometry';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, ...props }: ComponentProps<'a'> & { children: ReactNode }) => <a {...props}>{children}</a>,
}));

const countries = [
	{ code: 'KE', name: 'Kenya', href: '/countries/kenya' },
	{ code: 'sl', name: 'Sierra Leone', href: '/countries/sierra-leone' },
	{ code: 'gh', name: 'Ghana' },
];

const shapeOf = (code: string) => {
	const shape = AFRICA_MAP_SHAPES.find((candidate) => candidate.code === code);
	if (!shape) {
		throw new Error(`No shape for ${code}`);
	}

	return shape;
};

let container: HTMLDivElement;
let root: Root;

const render = (props: Partial<ComponentProps<typeof AfricaMap>> = {}) =>
	act(() => root.render(<AfricaMap label="Map of Africa" countries={countries} {...props} />));

const stage = () => container.querySelector<HTMLElement>('[role="group"]');
const popup = () => container.querySelector<HTMLElement>('[data-popup]');
const markerLabels = () =>
	[...container.querySelectorAll('li > a, li > button')].map((marker) => marker.getAttribute('aria-label'));
const viewBox = () => stage()?.querySelector('svg[viewBox]')?.getAttribute('viewBox');
const countryPath = (code: string) => container.querySelector(`[data-code="${code}"] path`);

const movePointer = (target: Element | null, x: number, y: number) =>
	act(() => {
		target?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: x, clientY: y }));
	});

const tap = (target: Element | null, x: number, y: number) => {
	jest.spyOn(document, 'elementFromPoint').mockReturnValue(target);
	// jsdom has no PointerEvent
	const pointerDown = Object.assign(new MouseEvent('pointerdown', { bubbles: true, clientX: x, clientY: y }), {
		pointerType: 'touch',
	});
	const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1, clientX: x, clientY: y });
	act(() => {
		target?.dispatchEvent(pointerDown);
		target?.dispatchEvent(click);
	});

	return click;
};

beforeEach(() => {
	jest.useFakeTimers();
	// jsdom has no layout: the map fills its frame from the top left, so a pointer position is a point of the map
	jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
		x: 0,
		y: 0,
		left: 0,
		top: 0,
		right: AFRICA_MAP_FRAME.width,
		bottom: AFRICA_MAP_FRAME.height,
		width: AFRICA_MAP_FRAME.width,
		height: AFRICA_MAP_FRAME.height,
		toJSON: () => ({}),
	});
	document.elementFromPoint = jest.fn();
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	jest.restoreAllMocks();
	jest.useRealTimers();
});

test('marks the countries from west to east and skips codes that are not on the map', () => {
	render({ countries: [...countries, { code: 'ch', name: 'Switzerland' }] });

	expect(markerLabels()).toEqual(['Sierra Leone', 'Ghana', 'Kenya']);
	expect(viewBox()).toBe(`0 0 ${AFRICA_MAP_FRAME.width} ${AFRICA_MAP_FRAME.height}`);
});

test('widens the map for a highlighted island state that lies outside of it', () => {
	render({ countries: [{ code: 'mu', name: 'Mauritius' }] });

	const [x, , width] = (viewBox() ?? '').split(' ').map(Number);
	expect(x).toBe(0);
	expect(width).toBeGreaterThan(shapeOf('mu').x);
	expect(markerLabels()).toEqual(['Mauritius']);
});

test('zooms in on a region and leaves out the highlighted countries outside of it', () => {
	render({ zoom: 'western' });

	const { x, y, width, height } = AFRICA_MAP_ZOOM.western;
	expect(viewBox()).toBe(`${x} ${y} ${width} ${height}`);
	expect(markerLabels()).toEqual(['Sierra Leone', 'Ghana']);
});

test('tints the countries of the shaded region', () => {
	render({ shadedRegion: 'southern' });
	expect(container.querySelectorAll('path[data-shaded]')).toHaveLength(5);

	render({ shadedRegion: 'subSaharan' });
	const visible = AFRICA_MAP_SHAPES.filter(({ x }) => x >= 0 && x <= AFRICA_MAP_FRAME.width);
	expect(container.querySelectorAll('path[data-shaded]')).toHaveLength(
		visible.filter(({ region }) => region !== 'northern').length,
	);
});

test('opens the popup of the country under the pointer and closes it once the pointer has left', () => {
	render();
	const kenya = shapeOf('ke');

	// Inside Kenya, away from its marker
	movePointer(countryPath('ke'), kenya.x - 30, kenya.y - 20);
	expect(popup()?.dataset.open).toBe('true');
	expect(popup()?.textContent).toContain('Kenya');
	expect(popup()?.querySelector('a')?.getAttribute('href')).toBe('/countries/kenya');

	movePointer(stage(), 500, 100);
	expect(popup()?.dataset.open).toBe('true');
	act(() => jest.advanceTimersByTime(200));
	expect(popup()?.dataset.open).toBe('false');
});

test('lets a marker catch a pointer that is close to it', () => {
	render();
	const ghana = shapeOf('gh');

	movePointer(stage(), ghana.x + 10, ghana.y);
	expect(popup()?.dataset.open).toBe('true');
	expect(popup()?.textContent).toBe('Ghana');
});

test('opens the popup on the first tap and follows the link on the second', () => {
	render();
	const sierraLeone = shapeOf('sl');
	const followLink = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

	const firstTap = tap(countryPath('sl'), sierraLeone.x, sierraLeone.y);
	expect(firstTap.defaultPrevented).toBe(true);
	expect(popup()?.dataset.open).toBe('true');
	expect(popup()?.textContent).toContain('Sierra Leone');
	expect(followLink).not.toHaveBeenCalled();

	tap(countryPath('sl'), sierraLeone.x, sierraLeone.y);
	expect(followLink).toHaveBeenCalledTimes(1);
});

test('closes the popup on a tap next to the countries', () => {
	render();
	const sierraLeone = shapeOf('sl');

	tap(countryPath('sl'), sierraLeone.x, sierraLeone.y);
	tap(stage(), 500, 100);
	expect(popup()?.dataset.open).toBe('false');
});

test('shows the detail of a country below its name, and to screen readers with the name', () => {
	render({ countries: [{ code: 'sl', name: 'Sierra Leone', href: '/countries/sierra-leone', detail: '1,250 recipients' }] });

	expect(markerLabels()).toEqual(['Sierra Leone, 1,250 recipients']);
	act(() => container.querySelector<HTMLAnchorElement>('li > a')?.focus());
	expect(popup()?.textContent).toBe('Sierra Leone1,250 recipients');
});

test('opens the popup of a marker that gets the keyboard focus', () => {
	render();

	act(() => container.querySelector<HTMLAnchorElement>('li > a[aria-label="Kenya"]')?.focus());
	expect(popup()?.dataset.open).toBe('true');
	expect(popup()?.textContent).toContain('Kenya');

	act(() => {
		stage()?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
	});
	expect(popup()?.dataset.open).toBe('false');
});
