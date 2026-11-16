/** @jest-environment jsdom */

import { Currency } from '@/generated/prisma/enums';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CampaignHero } from './campaign-hero';

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
	MediaHeroStats: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	MediaHeroStat: () => <div />,
}));

jest.mock('next-intl/server', () => ({
	getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock('@/components/campaign/campaign-donation/campaign-donation-form-server', () => ({
	CampaignDonationFormServer: () => <div data-testid="mock-donation-form" />,
}));

describe('CampaignHero', () => {
	beforeEach(() => {
		mockMediaHero.mockClear();
	});

	const dummyCampaign = {
		id: 'campaign-1',
		currency: Currency.CHF,
		endDate: new Date('2026-12-31'),
		createdAt: new Date('2026-01-01'),
		numberOfContributions: 10,
		amountCollected: 5000,
		percentageCollected: 50,
		daysLeft: 60,
		isActive: true,
		program: null,
	};

	test('computes proportional resize URL and passes objectPosition when primaryImage has valid focal point', async () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		const element = await CampaignHero({
			campaign: dummyCampaign,
			title: 'Save the Mangroves',
			creatorName: 'Jane Doe',
			quote: 'Every tree counts',
			primaryImage: {
				filename: 'https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/mangroves.jpg',
				alt: 'Mangrove forest',
				focus: '380x1154:381x1155',
			},
			lang: 'en',
		});

		act(() => root.render(element));

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		const passedImage = lastCall?.[0].image;
		expect(passedImage).toBeDefined();
		expect(passedImage?.src).not.toContain('_crop=');
		expect(passedImage?.src).toContain('_ratio=0.6672');
		expect(passedImage?.objectPosition).toBe(`${(380 / 3000) * 100}% ${(1154 / 2001) * 100}%`);

		act(() => root.unmount());
	});

	test('passes undefined objectPosition when primaryImage has no focus metadata', async () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		const element = await CampaignHero({
			campaign: dummyCampaign,
			title: 'Save the Mangroves',
			creatorName: 'Jane Doe',
			quote: 'Every tree counts',
			primaryImage: {
				filename: 'https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/mangroves.jpg',
				alt: 'Mangrove forest',
				focus: null,
			},
			lang: 'en',
		});

		act(() => root.render(element));

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		const passedImage = lastCall?.[0].image;
		expect(passedImage).toBeDefined();
		expect(passedImage?.objectPosition).toBeUndefined();

		act(() => root.unmount());
	});

	test('passes null image when primaryImage is omitted', async () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		const element = await CampaignHero({
			campaign: dummyCampaign,
			title: 'Save the Mangroves',
			creatorName: 'Jane Doe',
			quote: 'Every tree counts',
			lang: 'en',
		});

		act(() => root.render(element));

		expect(mockMediaHero).toHaveBeenCalledTimes(1);
		const lastCall = mockMediaHero.mock.calls[0];
		expect(lastCall).toBeDefined();
		expect(lastCall?.[0].image).toBeNull();

		act(() => root.unmount());
	});
});
