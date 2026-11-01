/** @jest-environment jsdom */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MediaHero } from './media-hero';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({
		alt,
		src,
		style,
		className,
	}: {
		alt: string;
		src: string;
		style?: Record<string, string>;
		className?: string;
	}) => <img data-testid="media-hero-image" alt={alt} src={src} style={style} className={className} />,
}));

describe('MediaHero', () => {
	test('renders image with object-position when objectPosition is provided', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<MediaHero
					image={{
						src: 'https://a.storyblok.com/f/123/1200x800/program.jpg',
						alt: 'Hero image',
						objectPosition: '25% 35%',
					}}
				>
					<h1>Title</h1>
				</MediaHero>,
			),
		);

		const img = container.querySelector<HTMLImageElement>('[data-testid="media-hero-image"]');
		expect(img).not.toBeNull();
		expect(img?.className).toContain('object-cover');
		expect(img?.className).toContain('[object-position:var(--media-hero-object-position)]');
		const frame = img?.parentElement;
		expect(frame?.style.getPropertyValue('--media-hero-object-position')).toBe('25% 35%');

		act(() => root.unmount());
	});

	test('renders image without object-position when objectPosition is omitted', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<MediaHero
					image={{
						src: 'https://a.storyblok.com/f/123/1200x800/program.jpg',
						alt: 'Hero image',
					}}
				>
					<h1>Title</h1>
				</MediaHero>,
			),
		);

		const img = container.querySelector<HTMLImageElement>('[data-testid="media-hero-image"]');
		expect(img).not.toBeNull();
		expect(img?.className).toContain('object-cover');
		expect(img?.className).not.toContain('[object-position:var(--media-hero-object-position)]');
		const frame = img?.parentElement;
		expect(frame?.style.getPropertyValue('--media-hero-object-position')).toBe('');

		act(() => root.unmount());
	});

	test('renders fallback when image is not provided', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<MediaHero image={null}>
					<h1>Title</h1>
				</MediaHero>,
			),
		);

		expect(container.querySelector('[data-testid="media-hero-image"]')).toBeNull();

		act(() => root.unmount());
	});
});
