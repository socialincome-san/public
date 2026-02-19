import { DefaultParams } from '@/app/[lang]/[region]';
import mapAfrica from '@/app/[lang]/[region]/(website)/our-work/(assets)/map-africa.svg';
import { RecipientsCarousel } from '@/app/[lang]/[region]/(website)/our-work/(sections)/recipients-carousel';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { BaseContainer, Typography } from '@socialincome/ui';
import _ from 'lodash';
import Image from 'next/image';
import aminataImg from '../(assets)/aminata.jpeg';
import gbassayImg from '../(assets)/gbassay.jpeg';
import kaiImg from '../(assets)/kai.jpg';
import laminImg from '../(assets)/lamin.jpeg';
import nenehImg from '../(assets)/neneh.jpeg';
import onikehImg from '../(assets)/onikeh.jpeg';

export const Recipients = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['countries', 'website-our-work'],
	});

	return (
		<BaseContainer id="recipients" className="flex scroll-mt-36 flex-col justify-center space-y-8">
			<div className="space-y-4">
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('recipients.header')}
				</Typography>
				<p className="mb-8 lg:mb-16">
					<Typography as="span" size="4xl" weight="bold">
						{translator.t('recipients.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="secondary">
						{translator.t('recipients.title-2')}
					</Typography>
				</p>
				<Typography size="xl">{translator.t('recipients.subtitle')}</Typography>
			</div>

			<div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
				<Image className="flex-1 px-16 py-4" src={mapAfrica} alt="Change animation" style={{ objectFit: 'cover' }} />
				<div className="space-y-4 md:p-4">
					<Typography as="h2" size="3xl" weight="bold">
						{translator.t('recipients.our-criteria')}
					</Typography>
					<ul className="flex flex-col space-y-8">
						{_.range(1, 4).map((i) => (
							<li key={i} className="flex flex-row items-start space-x-3">
								<CheckCircleIcon className="text-secondary h-8 w-8 flex-none" />
								<div className="space-y-2">
									<Typography size="xl" weight="bold">
										{translator.t(`recipients.item-${i}.title`)}
									</Typography>
									<Typography size="xl">{translator.t(`recipients.item-${i}.text`)}</Typography>
									<Typography size="lg" color="muted-foreground">
										{translator.t(`recipients.item-${i}.caption`)}
									</Typography>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="space-y-8">
				<Typography as="h2" size="3xl" weight="bold">
					{translator.t('recipients.voices')}
				</Typography>
				<RecipientsCarousel
					portraits={[
						{
							name: 'Kai Boima',
							text: translator.t('recipients.portraits.kai'),
							country: translator.t('SL'),
							image: kaiImg,
						},
						{
							name: 'Aminata Koroma',
							text: translator.t('recipients.portraits.aminata'),
							country: translator.t('SL'),
							image: aminataImg,
						},
						{
							name: 'Gbassay Kamara',
							text: translator.t('recipients.portraits.gbassay'),
							country: translator.t('SL'),
							image: gbassayImg,
						},
						{
							name: 'Lamin Kamara',
							text: translator.t('recipients.portraits.lamin'),
							country: translator.t('SL'),
							image: laminImg,
						},
						{
							name: 'Onikeh Randall',
							text: translator.t('recipients.portraits.onikeh'),
							country: translator.t('SL'),
							image: onikehImg,
						},
						{
							name: 'Neneh Kanteh',
							text: translator.t('recipients.portraits.neneh'),
							country: translator.t('SL'),
							image: nenehImg,
						},
					]}
				/>
			</div>
		</BaseContainer>
	);
}
