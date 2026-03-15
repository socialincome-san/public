import { FontColor } from '@socialincome/ui';
import { ReactElement } from 'react';

type QuoteType = {
	text: string;
	color: FontColor;
}[];

type FundRaiserBadgeType = {
	fundRaiserTranslation: string;
};

type SdgBadgeType = {
	hoverCardOrgName: string;
	sdgNumber: number;
	translatorSdg: string;
	translatorSdgTitle: string;
	translatorSdgMission1: string;
	translatorSdgMission2: string;
};

type CountryBadgeType = {
	countryFlagComponent?: ReactElement<any>;
	countryAbbreviation: string;
};

export type { CountryBadgeType, FundRaiserBadgeType, QuoteType, SdgBadgeType };
