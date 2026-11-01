/** @jest-environment jsdom */

import { act, createElement, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ImageCommentEditor } from './image-comment-editor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ unoptimized, ...props }: ComponentProps<'img'> & { unoptimized?: boolean }) => {
		void unoptimized;

		return createElement('img', props);
	},
}));

const labels = {
	addComment: 'Add comment',
	comment: 'Comment',
	remove: 'Remove',
	placeholder: 'Describe change',
	empty: 'Add a comment',
	helpLabel: 'How image edits work',
	help: 'Click to mark an area and describe the change.',
};

describe('ImageCommentEditor coordinates', () => {
	let container: HTMLDivElement;
	let root: Root;
	let comments: ComponentProps<typeof ImageCommentEditor>['comments'];
	let pin: HTMLButtonElement;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
		comments = [];
		const render = () =>
			root.render(
				createElement(ImageCommentEditor, {
					src: '/image.png',
					alt: 'Original',
					comments,
					onCommentsChange: (next) => {
						comments = next;
						render();
					},
					maxComments: 20,
					maxLength: 2000,
					labels,
				}),
			);
		void act(render);
		const surface = container.querySelector<HTMLButtonElement>('button[aria-label="Add comment"]');
		if (!surface?.parentElement) {
			throw new Error('Image surface missing');
		}
		surface.parentElement.getBoundingClientRect = () => new DOMRect(100, 50, 768, 432);
		void act(() => surface.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: 292, clientY: 158 })));
		const element = container.querySelector<HTMLButtonElement>('button[aria-label="Comment 1"]');
		if (!element) {
			throw new Error('Pin missing');
		}
		pin = element;
		pin.setPointerCapture = jest.fn();
		pin.releasePointerCapture = jest.fn();
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	const pointer = (type: string, x: number, y: number, pointerId = 1) => {
		const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
		Object.defineProperty(event, 'pointerId', { value: pointerId });
		void act(() => pin.dispatchEvent(event));
	};

	test('places at the displayed point and drags without jumping to an off-center grab', () => {
		expect(comments[0]).toMatchObject({ x: 0.25, y: 0.25 });
		pointer('pointerdown', 300, 162);
		pointer('pointermove', 500, 262);
		pointer('pointerup', 500, 262);
		expect(comments[0].x).toBeCloseTo(0.25 + 200 / 768);
		expect(comments[0].y).toBeCloseTo(0.25 + 100 / 432);
		act(() => pin.focus());
		void act(() => pin.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
		expect(document.activeElement).toBe(pin);
	});

	test('ignores small movements, unrelated pointers and canceled drags', () => {
		pointer('pointerdown', 300, 162);
		pointer('pointermove', 302, 164);
		pointer('pointermove', 600, 400, 2);
		expect(comments[0]).toMatchObject({ x: 0.25, y: 0.25 });
		pointer('pointercancel', 302, 164);
		pointer('pointermove', 500, 262);
		expect(comments[0]).toMatchObject({ x: 0.25, y: 0.25 });
		act(() => pin.click());
		expect(document.activeElement).toBe(container.querySelector('textarea'));
	});

	test('maps clicks on a portrait preview and keeps edge pins inside the image', () => {
		const surface = container.querySelector<HTMLButtonElement>('button[aria-label="Add comment"]');
		if (!surface?.parentElement) {
			throw new Error('Image surface missing');
		}
		surface.parentElement.getBoundingClientRect = () => new DOMRect(100, 50, 432, 768);
		void act(() => surface.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: 208, clientY: 626 })));
		void act(() => surface.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: 532, clientY: 818 })));
		expect(comments[1]).toMatchObject({ x: 0.25, y: 0.75 });
		expect(comments[2]).toMatchObject({ x: 1, y: 1 });
	});

	test('shows the help control beside the empty comment instructions', () => {
		const remove = container.querySelector<HTMLButtonElement>('button[aria-label="Remove Comment 1"]');
		void act(() => remove?.click());
		const help = container.querySelector('button[aria-label="How image edits work"]');
		expect(help?.closest('li')?.textContent).toContain('Add a comment');
	});
});
