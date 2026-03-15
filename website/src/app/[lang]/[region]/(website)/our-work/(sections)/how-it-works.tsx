import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { BaseContainer, Typography } from '@socialincome/ui';
import _ from 'lodash';
import Image from 'next/image';
import phonesGif from '../(assets)/phones-2.gif';

export const HowItWorks = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer id="how-it-works" className="flex flex-col justify-center space-y-8">
			<div className="space-y-4">
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('how-it-works.header')}
				</Typography>
				<p className="mb-8 lg:mb-16">
					<Typography as="span" size="4xl" weight="bold">
						{translator.t('how-it-works.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="secondary">
						{translator.t('how-it-works.title-2')}
					</Typography>
				</p>
				<Typography size="xl">{translator.t('how-it-works.text')}</Typography>
			</div>
			<div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
				<Image src={phonesGif} alt="Change animation" unoptimized />
				<div className="space-y-4 md:p-4">
					<Typography as="h2" size="3xl" weight="bold">
						{translator.t('how-it-works.subtitle')}
					</Typography>
					<ul className="flex flex-col space-y-4">
						{_.range(1, 4).map((i) => (
							<li key={i} className="flex flex-row items-start space-x-3">
								<CheckCircleIcon className="text-secondary h-8 w-8 flex-none" />
								<Typography size="xl">{translator.t(`how-it-works.item-${i}`)}</Typography>
							</li>
						))}
					</ul>
				</div>
			</div>
		</BaseContainer>
	);
};
