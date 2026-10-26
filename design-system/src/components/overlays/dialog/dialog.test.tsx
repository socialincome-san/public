/** @jest-environment jsdom */

import { act, createElement, type ReactNode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Dialog } from './dialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('vaul', () => ({
	Drawer: {
		Root: ({ children }: { children: ReactNode }) => createElement('div', { 'data-testid': 'drawer-root' }, children),
	},
}));

let mobile = false;
const subscribers = new Map<unknown, () => void>();
type QueryListener =
	((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | EventListenerOrEventListenerObject | null;
const query: MediaQueryList = {
	get matches() {
		return mobile;
	},
	media: '(width < 40rem)',
	onchange: null,
	addListener: () => undefined,
	removeListener: () => undefined,
	addEventListener: (_type: string, listener: QueryListener) => {
		subscribers.set(listener, () => {
			const event = Object.assign(new Event('change'), { matches: mobile, media: query.media });
			if (typeof listener === 'function') {
				listener.call(query, event);
			} else {
				listener?.handleEvent(event);
			}
		});
	},
	removeEventListener: (_type: string, listener: QueryListener) => {
		subscribers.delete(listener);
	},
	dispatchEvent: () => {
		for (const callback of subscribers.values()) {
			callback();
		}

		return true;
	},
};

const StatefulContent = () => {
	const [count, setCount] = useState(0);

	return createElement('button', { onClick: () => setCount((previous) => previous + 1) }, String(count));
};

describe('Dialog presentation', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		mobile = false;
		subscribers.clear();
		window.matchMedia = jest.fn(() => query);
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	const render = (presentation: 'adaptive' | 'dialog' = 'adaptive', open = true) => {
		act(() => {
			root.render(
				<Dialog open={open} onOpenChange={() => undefined} presentation={presentation}>
					<StatefulContent />
				</Dialog>,
			);
		});
	};
	const resize = (value: boolean) => {
		act(() => {
			mobile = value;
			query.dispatchEvent(new Event('change'));
		});
	};
	const increment = () => {
		const button = container.querySelector('button');
		if (!button) {
			throw new Error('Stateful content missing');
		}
		act(() => button.click());
	};

	test('keeps an opted-in editor in dialog mode on mobile', () => {
		mobile = true;
		render('dialog');
		expect(container.querySelector('[data-testid="drawer-root"]')).toBeNull();
		increment();
		resize(false);
		expect(container.textContent).toBe('1');
	});

	test('preserves the mobile drawer and its state while resizing an open dialog', () => {
		mobile = true;
		render();
		expect(container.querySelector('[data-testid="drawer-root"]')).not.toBeNull();
		increment();
		resize(false);
		expect(container.querySelector('[data-testid="drawer-root"]')).not.toBeNull();
		expect(container.textContent).toBe('1');
	});

	test('keeps an open desktop dialog stable and reevaluates its mode on the next opening', () => {
		render();
		increment();
		resize(true);
		expect(container.querySelector('[data-testid="drawer-root"]')).toBeNull();
		expect(container.textContent).toBe('1');
		render('adaptive', false);
		render();
		expect(container.querySelector('[data-testid="drawer-root"]')).not.toBeNull();
	});
});
