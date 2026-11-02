/** @jest-environment jsdom */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ImageGallery } from './image-gallery';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const images = Array.from({ length: 5 }, (_, index) => ({
	id: String(index),
	src: `/image-${index}.webp`,
	alt: `Image ${index}`,
}));

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
});

test('reveals one batch per click and removes the button after the final batch', () => {
	act(() =>
		root.render(
			<ImageGallery
				images={images}
				loadingLabel="Loading"
				errorLabel="Unavailable"
				pagination={{ pageSize: 2, loadMoreLabel: 'Load more' }}
			/>,
		),
	);
	expect(container.querySelectorAll('article')).toHaveLength(2);
	expect(container.querySelector('button')?.textContent).toBe('Load more');
	act(() => container.querySelector('button')?.click());
	expect(container.querySelectorAll('article')).toHaveLength(4);
	act(() => container.querySelector('button')?.click());
	expect(container.querySelectorAll('article')).toHaveLength(5);
	expect(container.querySelector('button')).toBeNull();
	expect([...container.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual(
		images.map((image) => image.src),
	);
});

test('does not offer more images when the complete list fits in the first batch', () => {
	act(() =>
		root.render(
			<ImageGallery
				images={images.slice(0, 2)}
				loadingLabel="Loading"
				errorLabel="Unavailable"
				pagination={{ pageSize: 2, loadMoreLabel: 'Load more' }}
			/>,
		),
	);
	expect(container.querySelectorAll('article')).toHaveLength(2);
	expect(container.querySelector('button')).toBeNull();
});

test('keeps all images visible when pagination is not configured', () => {
	act(() => root.render(<ImageGallery images={images} loadingLabel="Loading" errorLabel="Unavailable" />));
	expect(container.querySelectorAll('article')).toHaveLength(5);
	expect(container.querySelector('button')).toBeNull();
});
