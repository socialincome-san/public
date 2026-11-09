/** @jest-environment jsdom */

import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DataTableToolbar } from './data-table-toolbar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('DataTableToolbar search', () => {
	let container: HTMLDivElement;
	let root: Root;
	const onSearchChange = jest.fn();
	const render = (props: Partial<ComponentProps<typeof DataTableToolbar>> = {}) =>
		act(() =>
			root.render(<DataTableToolbar showControls searchKeys={['name']} onSearchChange={onSearchChange} {...props} />),
		);
	const desktopInput = () => {
		const input = container.querySelector<HTMLInputElement>('[data-testid="data-table-desktop-search-input"]');
		if (!input) {
			throw new Error('Desktop search input missing');
		}
		return input;
	};
	const changeInput = (input: HTMLInputElement, value: string) => {
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
		void act(() => input.dispatchEvent(new Event('input', { bubbles: true })));
	};

	beforeEach(() => {
		jest.clearAllMocks();
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	it('shows a desktop input and keeps the mobile search behind an icon', () => {
		void render();
		expect(container.querySelector('[data-testid="data-table-desktop-search"]')?.className).toContain(
			'hidden w-64 md:block',
		);
		expect(container.querySelector('[data-testid="data-table-mobile-search"]')?.className).toBe('md:hidden');
		expect(desktopInput().placeholder).toBe('Search...');
		expect(container.querySelector('button[aria-label="Search"]')).not.toBeNull();
	});

	it('forwards desktop input changes', () => {
		void render({ searchValue: 'Kamara' });
		expect(desktopInput().value).toBe('Kamara');
		changeInput(desktopInput(), 'Kamara Smith');
		expect(onSearchChange).toHaveBeenCalledWith('Kamara Smith');
	});

	it('preserves focus and ongoing input when a debounced value arrives', () => {
		void render({ searchValue: '' });
		const input = desktopInput();
		input.focus();
		changeInput(input, 'Kamara');
		void render({ searchValue: 'Kam' });
		expect(document.activeElement).toBe(input);
		expect(input.value).toBe('Kamara');
	});

	it('syncs external search changes when the desktop input is not being edited', () => {
		void render({ searchValue: 'Kamara' });
		void render({ searchValue: '' });
		expect(desktopInput().value).toBe('');
	});

	it('keeps the existing mobile popover functional', async () => {
		await render();
		await act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Search"]')?.click());
		const input = document.querySelector<HTMLInputElement>('[data-testid="data-table-search-input"]');
		if (!input) {
			throw new Error('Mobile search input missing');
		}
		changeInput(input, 'Kamara');
		expect(onSearchChange).toHaveBeenCalledWith('Kamara');
	});

	it('keeps the mobile input and cursor stable during debounced updates', async () => {
		await render({ searchValue: '' });
		await act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Search"]')?.click());
		const input = document.querySelector<HTMLInputElement>('[data-testid="data-table-search-input"]');
		if (!input) {
			throw new Error('Mobile search input missing');
		}
		input.focus();
		changeInput(input, 'Somaha');
		input.setSelectionRange(6, 6);
		await render({ searchValue: 'Som' });
		expect(document.querySelector('[data-testid="data-table-search-input"]')).toBe(input);
		expect(document.activeElement).toBe(input);
		expect(input.value).toBe('Somaha');
		expect(input.selectionStart).toBe(6);
		changeInput(input, 'Somaha Operations');
		expect(onSearchChange).toHaveBeenLastCalledWith('Somaha Operations');
	});

	it.each([{ showControls: false }, { searchKeys: [] }])('hides unavailable search: %j', (props) => {
		void render(props);
		expect(container.querySelector('[data-testid="data-table-desktop-search-input"]')).toBeNull();
		expect(container.querySelector('button[aria-label="Search"]')).toBeNull();
	});
});
