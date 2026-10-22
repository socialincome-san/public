/** @jest-environment jsdom */

import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageUpload } from './image-upload';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

test('keeps the input ref and remove action working across parent rerenders', () => {
	URL.createObjectURL = jest.fn(() => 'blob:reference');
	const revokeObjectURL = jest.fn();
	URL.revokeObjectURL = revokeObjectURL;
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const inputRef = createRef<HTMLInputElement>();
	const props = {
		name: 'referenceImage',
		acceptedTypes: ['image/png'],
		maxSizeBytes: 1024,
		label: 'Reference image',
		optionalLabel: 'optional',
		dropLabel: 'Drop',
		browseLabel: 'Browse',
		previewLabel: 'Preview',
		removeLabel: 'Remove reference image',
		helperText: 'PNG',
		invalidFileMessage: 'Invalid file',
		inputRef,
	};
	try {
		act(() => root.render(<ImageUpload {...props} />));
		const input = inputRef.current;
		if (!input) {
			throw new Error('Missing input');
		}
		Object.defineProperty(input, 'files', {
			configurable: true,
			value: [new File(['png'], 'reference.png', { type: 'image/png' })],
		});
		act(() => {
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
		act(() => root.render(<ImageUpload {...props} disabled />));
		act(() => root.render(<ImageUpload {...props} />));
		expect(inputRef.current).toBe(input);
		const remove = container.querySelector('button');
		if (!remove) {
			throw new Error('Missing remove button');
		}
		act(() => remove.click());
		expect(container.querySelector('button')).toBeNull();
		expect(input.value).toBe('');
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:reference');
		act(() => {
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
		expect(container.querySelector('button')).not.toBeNull();
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});
