import { DefaultParams } from '@/app/[lang]/[region]';
import TechCard from '@/app/[lang]/[region]/(website)/techstack/(sections)/techcard';
import { Translator } from '@socialincome/shared/src/utils/i18n';

type TechEntryJSON = {
	title: string;
	description: string;
	link: string;
	logo: string;
	donated: boolean;
};

export async function TechList({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-techstack'],
	});

	const techArray: TechEntryJSON[] = translator.t('cards');

	return (
		<div className="mx-auto max-w-6xl">
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				{techArray.map((techEntry, index) => (
					<TechCard {...techEntry} translations={{badgeDonated: translator.t('badges.donated')}} key={index} />
				))}
			</div>
		</div>
	);
}
