import { DefaultParams } from '@/app/[lang]/[region]';
import NgoCard from '@/app/[lang]/[region]/(website)/partners/(sections)/ngocard';
import { CountryBadgeType, SdgBadgeType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { NgoCardProps, NgoEntryJSON, NgoHoverCardType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { CH, SL } from 'country-flag-icons/react/1x1';

const SL_Flag = SL as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const CH_Flag = CH as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;

const country_abbreviations_to_flag_map: Record<string, React.ReactElement> = {
	SL: <SL_Flag className="h-5 w-5 rounded-full" />,
	CH: <CH_Flag className="h-5 w-5 rounded-full" />,
};

const getFlag = (abbreviation: string): React.ReactElement => {
	return country_abbreviations_to_flag_map[abbreviation] ?? <SL_Flag className="h-5 w-5 rounded-full" />;
};
export const ngos = ['aurora', 'jamil', 'reachout', 'equal_rights', 'united_polio', 'slaes', 'lizardearth', 'rainbo'];

export const NgoList = async ({ lang, region }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-partners'],
	});
	const image_base_path = '/assets/partners/';

	const ngoArray: NgoEntryJSON[] = ngos.map((slug: string) => translator.t(slug));
	const ngoCardPropsArray: NgoCardProps[] = [];

	for (const ngo of ngoArray) {
		const sdgBadges: SdgBadgeType[] = [];
		ngo['org-focus-sdg-numbers'].forEach((sdgNumber) => {
			sdgBadges.push({
				hoverCardOrgName: ngo['org-short-name'],
				sdgNumber: sdgNumber,
				translatorSdg: '',
				translatorSdgTitle: '',
				translatorSdgMission1: '',
				translatorSdgMission2: '',
			});
		});

		const countryBadge: CountryBadgeType = {
			countryAbbreviation: ngo['org-country'],
			countryFlagComponent: getFlag(ngo['org-country']),
		};
		const ngoHoverCard: NgoHoverCardType = {
			orgImage: image_base_path.concat(ngo['org-image']),
			orgLongName: ngo['org-long-name'],
			partnershipStart: ngo['partnership-start'],
			orgDescriptionParagraphs: ngo['org-description-paragraphs'],
			quote: ngo['org-quote'] ?? null,
			quoteAuthor: ngo['org-quote-author'] ?? null,
			quotePhoto: ngo['org-quote-photo'] ? image_base_path.concat(ngo['org-quote-photo']) : null,
			orgFoundation: ngo['org-foundation'],
			orgHeadquarter: ngo['org-headquarter'],
			orgWebsite: ngo['org-website'] ?? null,
			orgFacebook: ngo['org-facebook'] ?? null,
			orgInstagram: ngo['org-instagram'] ?? null,
			orgLinkedIn: ngo['org-linkedin'] ?? null,
			orgYoutube: ngo['org-youtube'] ?? null,
			orgFundRaiserText: ngo['org-fundraiser-text'] ?? null,
			orgSlug: ngo['org-slug'],
		};

		const ngoCardProps: NgoCardProps = {
			orgShortName: ngo['org-short-name'],
			orgMission: ngo['org-mission'],
			countryBadge: countryBadge,
			sdgBadges: sdgBadges,
			ngoHoverCard: ngoHoverCard,
			lang: lang as WebsiteLanguage,
			region: region as WebsiteRegion,
		};
		ngoCardPropsArray.push(ngoCardProps);
	}

	return (
		<div className="mx-auto max-w-6xl">
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				{ngoCardPropsArray.map((props, index) => (
					<NgoCard key={index} {...props} />
				))}
			</div>
		</div>
	);
};
