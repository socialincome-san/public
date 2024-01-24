import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image from 'next/image';
import AboutSiPic from './(assets)/AboutSI.png';

export async function AboutSI({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer>
			<Typography as="h2" size="2xl" weight="bold" className="mb-5">
				{translator.t('aboutsi.title')}
			</Typography>
			<div className="flex flex-col sm:flex-row">
				<div className="flex flex-col sm:w-1/2">
					<Image src={AboutSiPic} alt="AboutSi picture" className="mb-2 w-4/5 rounded-3xl" />
					<Typography as="p" size="xs" className="mb-8 sm:mb-0">
						{translator.t('aboutsi.credits')}
					</Typography>
				</div>
				<Typography as="h3" size="xl" weight="medium" className="mr-10 text-left sm:w-1/2">
					{translator.t('aboutsi.text-1')}
					<br />
					<br />
					{translator.t('aboutsi.text-2')}
				</Typography>
			</div>
		</BaseContainer>
	);
}
