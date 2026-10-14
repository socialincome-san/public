/** @jest-environment jsdom */

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QuantitySelector } from './quantity-selector';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const resizeObserverNoop = () => undefined;

class ResizeObserverStub {
	observe = resizeObserverNoop;
	unobserve = resizeObserverNoop;
	disconnect = resizeObserverNoop;
}

globalThis.ResizeObserver = ResizeObserverStub;

describe('QuantitySelector', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	test('clamps a typed quantity to the available maximum', () => {
		const onChange = jest.fn();

		act(() => {
			root.render(
				createElement(QuantitySelector, {
					label: 'Recipients',
					value: 2,
					min: 1,
					max: 5,
					onChange,
					inputTestId: 'quantity-input',
				}),
			);
		});

		const input = container.querySelector('input');
		if (!(input instanceof HTMLInputElement)) {
			throw new Error('Quantity input missing');
		}

		act(() => {
			const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
			descriptor?.set?.call(input, '99');
			input.dispatchEvent(new Event('input', { bubbles: true }));
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});

		act(() => {
			input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		});

		expect(onChange).toHaveBeenCalledWith(5);
	});
});
