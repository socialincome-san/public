/** @jest-environment jsdom */

import { act, createElement, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ImageCommentEditor } from './image-comment-editor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub implements ResizeObserver {
	constructor(private callback: ResizeObserverCallback) {}
	observe = (target: Element) =>
		this.callback(
			[
				{
					target,
					contentRect: new DOMRect(0, 0, 768, 432),
					borderBoxSize: [],
					contentBoxSize: [],
					devicePixelContentBoxSize: [],
				},
			],
			this,
		);
	unobserve = () => undefined;
	disconnect = () => undefined;
}
globalThis.ResizeObserver = ResizeObserverStub;

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ unoptimized, ...props }: ComponentProps<'img'> & { unoptimized?: boolean }) => {
		void unoptimized;

		return createElement('img', props);
	},
}));

const labels = {
	place: 'Place comment',
	loading: 'Loading',
	loadError: 'Load failed',
	comment: 'Comment',
	comments: 'Comments',
	cancel: 'Cancel',
	placeholder: 'Describe change',
	remove: 'Remove',
	empty: 'Add comments',
	apply: 'Apply',
	pending: 'Pending',
};

describe('ImageCommentEditor', () => {
	let container: HTMLDivElement;
	let root: Root;
	let onApply: jest.Mock;
	let onCancel: jest.Mock;

	const button = (label: string) => {
		const element = [...container.querySelectorAll('button')].find(
			(item) => item.getAttribute('aria-label') === label || item.textContent === label,
		);
		if (!element) {
			throw new Error(`Button missing: ${label}`);
		}

		return element;
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
		onApply = jest.fn();
		onCancel = jest.fn();
		act(() =>
			root.render(
				createElement(ImageCommentEditor, {
					src: '/image.png',
					alt: 'Original',
					maxComments: 20,
					maxLength: 2000,
					onApply,
					onCancel,
					labels,
				}),
			),
		);
		const image = container.querySelector('img');
		if (!image) {
			throw new Error('Image missing');
		}
		Object.defineProperties(image, { naturalWidth: { value: 1536 }, naturalHeight: { value: 864 } });
		act(() => {
			image.dispatchEvent(new Event('load'));
		});
		const placement = button('Place comment');
		placement.getBoundingClientRect = () => ({
			x: 100,
			y: 50,
			left: 100,
			top: 50,
			right: 868,
			bottom: 482,
			width: 768,
			height: 432,
			toJSON: () => ({}),
		});
		if (!placement.parentElement) {
			throw new Error('Image frame missing');
		}
		placement.parentElement.getBoundingClientRect = () => placement.getBoundingClientRect();
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	const place = (x: number, y: number) => {
		act(() => {
			button('Place comment').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: x, clientY: y }));
		});
	};
	const typeComment = (index: number, text: string) => {
		const input = container.querySelectorAll('textarea')[index];
		act(() => {
			Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(input, text);
			input.dispatchEvent(new Event('input', { bubbles: true }));
		});
	};
	const pointer = (pin: HTMLButtonElement, type: string, x: number, y: number, pointerId = 1) => {
		const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
		Object.defineProperty(event, 'pointerId', { value: pointerId });
		act(() => {
			pin.dispatchEvent(event);
		});
	};
	const draggablePin = (label: string) => {
		const pin = button(label);
		const setPointerCapture = jest.fn();
		const releasePointerCapture = jest.fn();
		pin.setPointerCapture = setPointerCapture;
		pin.releasePointerCapture = releasePointerCapture;

		return { pin, setPointerCapture, releasePointerCapture };
	};

	test('scales pointer positions to original pixels and submits multiple comments', () => {
		place(292, 158);
		typeComment(0, 'Change shirt');
		place(676, 374);
		typeComment(1, 'Remove object');
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenCalledWith([
			{ x: 384, y: 216, text: 'Change shirt' },
			{ x: 1152, y: 648, text: 'Remove object' },
		]);
	});

	test('requires text, focuses new comments and keeps pins aligned after removal', () => {
		place(292, 158);
		expect(button('Apply').disabled).toBe(true);
		expect(document.activeElement).toBe(container.querySelector('textarea'));
		typeComment(0, 'First');
		place(676, 374);
		typeComment(1, 'Second');
		act(() => button('Remove Comment 1').click());
		act(() => button('Comment 1').click());
		expect(document.activeElement).toBe(container.querySelector('textarea'));
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenCalledWith([{ x: 1152, y: 648, text: 'Second' }]);
	});

	test('supports keyboard placement and clamps edge clicks inside the image', () => {
		act(() => {
			button('Place comment').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		});
		act(() => button('Place comment').click());
		typeComment(0, 'Keyboard');
		place(868, 482);
		typeComment(1, 'Corner');
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenCalledWith([
			{ x: 783.36, y: 432, text: 'Keyboard' },
			{ x: 1535, y: 863, text: 'Corner' },
		]);
	});

	test('blocks applying blank comments and enforces the comment limit', () => {
		for (let index = 0; index < 20; index++) {
			place(292, 158);
		}
		expect(container.querySelectorAll('textarea')).toHaveLength(20);
		expect(button('Place comment').disabled).toBe(true);
		expect(button('Apply').disabled).toBe(true);
		typeComment(0, '   ');
		expect(button('Apply').disabled).toBe(true);
		act(() => button('Remove Comment 1').click());
		expect(button('Place comment').disabled).toBe(false);
	});

	test('disables placement, inputs, pins and removal while applying', () => {
		place(292, 158);
		typeComment(0, 'Change detail');
		act(() =>
			root.render(
				createElement(ImageCommentEditor, {
					src: '/image.png',
					alt: 'Original',
					maxComments: 20,
					maxLength: 2000,
					onApply,
					labels,
					disabled: true,
					onCancel,
				}),
			),
		);
		expect(button('Place comment').disabled).toBe(true);
		expect(button('Comment 1').disabled).toBe(true);
		expect(button('Remove Comment 1').disabled).toBe(true);
		expect(button('Pending').disabled).toBe(true);
		expect(container.querySelector('textarea')?.disabled).toBe(true);
		expect(container.querySelector('textarea')?.value).toBe('Change detail');
		expect(onApply).not.toHaveBeenCalled();
	});

	test('cancels without applying comments', () => {
		place(292, 158);
		expect(container.querySelectorAll('textarea')).toHaveLength(1);
		expect(container.textContent).toContain('Comments (1)');
		typeComment(0, 'Change the center');
		act(() => button('Cancel').click());
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onApply).not.toHaveBeenCalled();
	});

	test('drags a pin without jumping at the grab point or changing its comment', () => {
		place(292, 158);
		typeComment(0, 'Change shirt');
		const { pin, setPointerCapture, releasePointerCapture } = draggablePin('Comment 1');
		act(() => pin.focus());
		pointer(pin, 'pointerdown', 300, 162);
		pointer(pin, 'pointermove', 500, 262);
		pointer(pin, 'pointerup', 500, 262);
		act(() => {
			pin.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		});
		expect(document.activeElement).toBe(pin);
		expect(container.querySelectorAll('textarea')).toHaveLength(1);
		expect(setPointerCapture).toHaveBeenCalledWith(1);
		expect(releasePointerCapture).toHaveBeenCalledWith(1);
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenCalledWith([{ x: 784, y: 416, text: 'Change shirt' }]);
	});

	test('clamps dragged pins to the image and ignores unrelated pointers', () => {
		place(292, 158);
		typeComment(0, 'First');
		place(676, 374);
		typeComment(1, 'Second');
		const { pin } = draggablePin('Comment 1');
		pointer(pin, 'pointerdown', 292, 158);
		pointer(pin, 'pointermove', 0, 0, 2);
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenLastCalledWith([
			{ x: 384, y: 216, text: 'First' },
			{ x: 1152, y: 648, text: 'Second' },
		]);
		pointer(pin, 'pointermove', 1000, 600);
		pointer(pin, 'pointerup', 1000, 600);
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenLastCalledWith([
			{ x: 1535, y: 863, text: 'First' },
			{ x: 1152, y: 648, text: 'Second' },
		]);
		pointer(pin, 'pointerdown', 867.5, 481.5);
		pointer(pin, 'pointermove', 0, 0);
		pointer(pin, 'pointerup', 0, 0);
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenLastCalledWith([
			{ x: 0, y: 0, text: 'First' },
			{ x: 1152, y: 648, text: 'Second' },
		]);
	});

	test('ends canceled drags and preserves normal click-to-focus behavior', () => {
		place(292, 158);
		typeComment(0, 'Detail');
		const { pin } = draggablePin('Comment 1');
		pointer(pin, 'pointerdown', 292, 158);
		pointer(pin, 'pointermove', 492, 258);
		pointer(pin, 'pointercancel', 492, 258);
		pointer(pin, 'pointermove', 692, 358);
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenLastCalledWith([{ x: 784, y: 416, text: 'Detail' }]);
		pointer(pin, 'pointerdown', 492, 258);
		pointer(pin, 'pointerup', 493, 259);
		act(() => pin.click());
		expect(document.activeElement).toBe(container.querySelector('textarea'));
	});

	test('moves a focused pin with arrow keys and Shift without editing the text', () => {
		place(292, 158);
		typeComment(0, 'Detail');
		const pin = button('Comment 1');
		act(() => {
			pin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		});
		act(() => {
			pin.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true }));
		});
		act(() => button('Apply').click());
		expect(onApply).toHaveBeenCalledWith([{ x: 385, y: 226, text: 'Detail' }]);
	});
});
