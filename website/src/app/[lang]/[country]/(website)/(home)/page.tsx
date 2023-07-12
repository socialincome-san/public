import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Input, Typography } from '@socialincome/ui';
import Image from 'next/image';
import houseGif from './house.gif';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<>
			<BaseContainer className="bg-blue-50">
				<div className="flex flex-row items-center h-[calc(100vh-theme(spacing.20))]">
					<div className="flex-1 p-8">
						<Typography size="4xl" weight="bold" lineHeight="relaxed">
							{translator.t('section-1.title-1')}
							<Typography as="span" size="4xl" weight="bold" color="accent" lineHeight="relaxed">
								{translator.t('section-1.title-2')}
							</Typography>
							{translator.t('section-1.title-3')}
						</Typography>
					</div>
					<div className="flex flex-col flex-1 p-8">
						<Typography size="2xl">{translator.t('section-1.income-text')}</Typography>
						<Input placeholder="6700" className="my-4" />
						<Button color="secondary" size="lg" className="btn-block">
							Show my Impact
						</Button>
					</div>
				</div>
			</BaseContainer>
			<BaseContainer className="bg-amber-50">
				<div className="flex flex-row items-center h-screen">
					<div className="flex-1 p-8">
						<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
							{translator.t('section-2.title-1')}
						</Typography>
						<Typography as="span" size="4xl" weight="bold" color="accent" lineHeight="relaxed">
							{translator.t('section-2.title-2')}
						</Typography>
						<Typography size="xl" className="mt-4">
							{translator.t('section-2.subtitle-1')}
						</Typography>
					</div>
					<div className="flex-1">
						<Image src={houseGif} width={500} height={500} alt="House Animation for Video Preview" />
					</div>
				</div>
			</BaseContainer>
		</>
	);
}
