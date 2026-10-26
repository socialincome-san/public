import { CountryOfficeBlock } from '@/components/content-blocks/country-office';
import { CountryPersonCarousel } from '@/components/storyblok/country/country-person-carousel';
import type { CountryStory } from '@/components/storyblok/country/country.types';
import type { CountryOffice } from '@/generated/storyblok/types/109655/country-office-components';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk } from '@/lib/result';
import {
	getPersonsByCountryOfficeAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CountryOfficeSection } from './country-office-section';

jest.mock('@/modules/storyblok-content/storyblok-content.actions', () => ({
	getPersonsByCountryOfficeAction: jest.fn(),
	getPrimaryRoleLabelsAction: jest.fn(),
}));

jest.mock('next-intl/server', () => ({ getTranslations: jest.fn(() => Promise.resolve(() => 'Show next person')) }));

jest.mock('@/components/storyblok/shared/person-card', () => ({
	PersonCard: ({ person, roleLabels }: { person: ISbStoryData<Person>; roleLabels: Record<string, string> }) => (
		<div>
			{person.content.fullName}
			{roleLabels.coordinator}
		</div>
	),
}));

jest.mock('@socialincome/design-system/data-display/carousel/carousel', () => ({
	Carousel: ({ children }: { children: ReactNode }) => <div data-carousel>{children}</div>,
	CarouselContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CarouselItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CarouselScrollNextButton: ({ 'aria-label': label }: { 'aria-label': string }) => <button aria-label={label} />,
}));

const person = (id: number): ISbStoryData<Person> => ({
	id,
	uuid: `person-${id}`,
	name: `Person ${id}`,
	slug: `person-${id}`,
	full_slug: `persons/person-${id}`,
	created_at: '',
	published_at: null,
	first_published_at: null,
	alternates: [],
	group_id: '',
	lang: 'en',
	meta_data: null,
	parent_id: null,
	position: id,
	sort_by_date: null,
	tag_list: [],
	content: {
		component: 'person',
		_uid: `person-${id}`,
		fullName: `Person ${id}`,
		firstName: 'Person',
		lastName: String(id),
		avatar: { id: 0, filename: '', name: '', alt: '', title: '', fieldtype: 'asset', focus: '', copyright: '' },
	},
});

const props = { isoCode: 'LR', title: 'Country office', heading: 'Liberia', lang: 'en' as const };

describe('CountryOfficeSection', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(getPrimaryRoleLabelsAction).mockResolvedValue(resultOk({ coordinator: 'Coordinator' }));
	});

	it.each([1, 2])('renders %i employees as a static list without carousel controls', async (count) => {
		jest
			.mocked(getPersonsByCountryOfficeAction)
			.mockResolvedValue(resultOk(Array.from({ length: count }, (_, i) => person(i + 1))));
		const markup = renderToStaticMarkup(await CountryOfficeSection(props));
		expect(markup).toContain('<ul');
		expect(markup.match(/<li>/g)).toHaveLength(count);
		expect(markup).toContain('Coordinator');
		expect(markup).not.toContain('data-carousel');
		expect(markup).not.toContain('<button');
		expect(getTranslations).not.toHaveBeenCalled();
	});

	it('renders larger teams in the existing carousel', async () => {
		jest.mocked(getPersonsByCountryOfficeAction).mockResolvedValue(resultOk([person(1), person(2), person(3)]));
		const markup = renderToStaticMarkup(await CountryOfficeSection(props));
		expect(markup).toContain('data-carousel');
		expect(markup).toContain('aria-label="Show next person"');
		expect(markup).not.toContain('<ul');
		expect(getTranslations).toHaveBeenCalledWith({ locale: 'en', namespace: 'website-common' });
	});

	it.each([resultOk([]), resultFail('Unavailable')])('hides empty or unavailable teams', async (result) => {
		jest.mocked(getPersonsByCountryOfficeAction).mockResolvedValue(result);
		expect(await CountryOfficeSection(props)).toBeNull();
	});

	it('keeps employees visible when role labels are unavailable', async () => {
		jest.mocked(getPersonsByCountryOfficeAction).mockResolvedValue(resultOk([person(1)]));
		jest.mocked(getPrimaryRoleLabelsAction).mockResolvedValue(resultFail('Unavailable'));
		expect(renderToStaticMarkup(await CountryOfficeSection(props))).toContain('Person 1');
	});

	it.each(['', ' ', '-', 'invalid'])('does not fetch an invalid office code: %s', async (isoCode) => {
		expect(await CountryOfficeSection({ ...props, isoCode })).toBeNull();
		expect(getPersonsByCountryOfficeAction).not.toHaveBeenCalled();
	});

	it('normalizes the office code and forwards wrapper configuration', async () => {
		jest.mocked(getPersonsByCountryOfficeAction).mockResolvedValue(resultOk([person(1)]));
		const markup = renderToStaticMarkup(
			await CountryOfficeSection({ ...props, isoCode: ' lr ', wrapperProps: { marginTop: 'none', 'aria-label': 'office' } }),
		);
		expect(getPersonsByCountryOfficeAction).toHaveBeenCalledWith({ language: 'en', values: ['lr'] });
		expect(markup).toContain('mt-0');
		expect(markup).toContain('aria-label="office"');
	});

	it('maps standalone CMS fields to the shared section', () => {
		const blok: CountryOffice = {
			component: 'countryOffice',
			_uid: 'office',
			_editable: '<!--#storyblok#{"name":"countryOffice","space":"109655","uid":"office","id":"123"}-->',
			countryOffice: 'LR',
			title: 'Country office',
			heading: 'Liberia',
			description: 'Local team',
			marginTop: 'none',
			marginBottom: 'sm',
		};
		const element = CountryOfficeBlock({ blok, lang: 'en' });
		expect(element.type).toBe(CountryOfficeSection);
		expect(element.props).toMatchObject({
			...props,
			description: 'Local team',
			wrapperProps: { marginTop: 'none', marginBottom: 'sm', 'data-blok-uid': '123-office' },
		});
	});

	it('maps existing country fields without a content migration', () => {
		const country: CountryStory = {
			...person(1),
			content: {
				component: 'Country',
				_uid: 'country',
				isoCode: 'LR',
				title: 'Liberia',
				countryOfficeTitle: 'Country office',
				countryOfficeDescription: 'Local team',
				description: { type: 'doc', content: [] },
				heroImage: person(1).content.avatar,
			},
		};
		const element = CountryPersonCarousel({ country, lang: 'en' });
		expect(element.type).toBe(CountryOfficeSection);
		expect(element.props).toEqual({ ...props, description: 'Local team' });
	});
});
