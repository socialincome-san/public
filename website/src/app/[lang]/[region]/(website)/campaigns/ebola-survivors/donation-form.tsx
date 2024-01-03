'use client';

import placeholderImage from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/placeholder.png';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import Image from 'next/image';

export async function DonationForm({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="p-0">
			<div className="text-left">
				<div className="mr-4 overflow-hidden">
					<Image src={placeholderImage} alt="Placeholder Image" />
				</div>
			</div>
			<div className="text-left">
				All of this campaigns donations are used to finance the basic income program for Ebola survivors. Funds beyond
				the goal of USD 200,000 are used to support people living in extreme poverty in Sierra Leone.
			</div>
		</BaseContainer>
	);
}
