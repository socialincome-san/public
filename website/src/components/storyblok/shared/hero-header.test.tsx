/** @jest-environment jsdom */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroHeader } from './hero-header';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type MockMediaHeroImage = {
	src: string;
	alt: string;
	objectPosition?: string;
};

type MockMediaHeroProps = {
	image?: MockMediaHeroImage | null;
	children?: React.ReactNode;
	aside?: React.ReactNode;
	mobileAside?: React.ReactNode;
};

const mockMediaHero = jest.fn((props: MockMediaHeroProps) => Boolean(props));

jest.mock('@socialincome/design-system/layout/media-hero/media-hero', () => ({
	MediaHero: (props: MockMediaHeroProps) => {
		mockMediaHero(props);

		return <div data-testid="mock-media-hero" />;
	},
	MediaHeroIntro: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	MediaHeroChips: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	MediaHeroPill: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/donation-wizard/donation-form', () => ({
	DonationForm: () => <div data-testid="mock-donation-form" />,
}));

describe('HeroHeader', () => {
	beforeEach(() => {
		mockMediaHero.mockClear();
	});

	test('computes proportional resize URL and passes objectPosition when heroImage has valid focal point', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<HeroHeader
					title="Sierra Leone Program"
					heroImage={{
						filename: 'https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/alligator-crocodile.jpg',
						alt: 'Program hero',
						focus: '380x1154:381x1155',
					}}
					stats={[]}
				/>,
			),
		);

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		const passedImage = lastCall?.[0].image;
		expect(passedImage).toBeDefined();
		// Must deliver a proportional resize URL without pre-applied focal crop
		expect(passedImage?.src).not.toContain('_crop=');
		expect(passedImage?.src).toContain('_ratio=0.6672');
		expect(passedImage?.objectPosition).toBe(`${(380 / 3000) * 100}% ${(1154 / 2001) * 100}%`);

		act(() => root.unmount());
	});

	test('computes proportional resize URL for portrait assets without pre-applied focal crop', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<HeroHeader
					title="Portrait Program"
					heroImage={{
						filename: 'https://a.storyblok.com/f/109655/800x1200/0b43ecee20/portrait.jpg',
						alt: 'Portrait hero',
						focus: '400x300:401x301',
					}}
					stats={[]}
				/>,
			),
		);

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		const passedImage = lastCall?.[0].image;
		expect(passedImage).toBeDefined();
		expect(passedImage?.src).not.toContain('_crop=');
		expect(passedImage?.src).toContain('_ratio=1.5000');
		expect(passedImage?.objectPosition).toBe('50% 25%');

		act(() => root.unmount());
	});

	test('passes undefined objectPosition when heroImage has no focus metadata', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() =>
			root.render(
				<HeroHeader
					title="Sierra Leone Program"
					heroImage={{
						filename: 'https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/alligator-crocodile.jpg',
						alt: 'Program hero',
						focus: null,
					}}
					stats={[]}
				/>,
			),
		);

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		const passedImage = lastCall?.[0].image;
		expect(passedImage).toBeDefined();
		expect(passedImage?.objectPosition).toBeUndefined();

		act(() => root.unmount());
	});

	test('passes null image when heroImage is not provided', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() => root.render(<HeroHeader title="No Image" stats={[]} />));

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		expect(lastCall?.[0].image).toBeNull();

		act(() => root.unmount());
	});
});
