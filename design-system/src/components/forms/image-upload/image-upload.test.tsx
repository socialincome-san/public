/** @jest-environment jsdom */

import { act, createElement, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ImageUpload } from './image-upload';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: () => 'blob:reference' });
Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined });

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ fill, unoptimized, ...props }: ComponentProps<'img'> & { fill?: boolean; unoptimized?: boolean }) => {
		void fill;
		void unoptimized;

		return createElement('img', props);
	},
}));

describe('ImageUpload attachment preview', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
		jest.restoreAllMocks();
	});

	test('clears the preview when the remove control is clicked', () => {
		act(() => {
			root.render(
				createElement(ImageUpload, {
					name: 'referenceImage',
					acceptedTypes: ['image/png'],
					maxSizeBytes: 1024,
					label: 'Reference image',
					optionalLabel: '(optional)',
					dropLabel: 'Drop an image or',
					browseLabel: 'browse',
					previewLabel: 'Selected reference image',
					removeLabel: 'Remove reference image',
					helperText: 'PNG',
					invalidFileMessage: 'Invalid image.',
					variant: 'attachment',
				}),
			);
		});

		const input = container.querySelector<HTMLInputElement>('input[type="file"]');
		expect(input).not.toBeNull();
		if (!input) {
			throw new Error('Image input missing');
		}

		Object.defineProperty(input, 'files', {
			configurable: true,
			value: [new File(['image'], 'reference.png', { type: 'image/png' })],
		});
		void act(() => input.dispatchEvent(new Event('change', { bubbles: true })));

		const removeButton = container.querySelector<HTMLButtonElement>('button[aria-label="Remove reference image"]');
		expect(removeButton).not.toBeNull();
		if (!removeButton) {
			throw new Error('Remove button missing');
		}

		act(() => removeButton.click());

		expect(container.querySelector('button[aria-label="Remove reference image"]')).toBeNull();
		expect(container.querySelector('img[alt="Selected reference image"]')).toBeNull();
	});
});
