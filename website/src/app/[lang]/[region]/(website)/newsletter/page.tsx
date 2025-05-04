import { DefaultPageProps } from '@/app/[lang]/[region]';
import aurelieImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/aurelie.jpeg';
import { SubscriptionInfoForm } from '@/app/[lang]/[region]/(website)/newsletter/subscription-info-form';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-newsletter');
}

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-newsletter'],
	});

	return (
		<BaseContainer className="py-12">
			<div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
				<div className="flex flex-col justify-center gap-3">
					<Typography size="5xl" weight="bold" className="mt-2">
						{translator.t('updates.title')}
					</Typography>
					<div className="my-8 text-xl">
						<Typography>{translator.t('updates.description-1')}</Typography>
						<div className="mt-4">
							<ul className="mt-2 list-disc pl-5 leading-relaxed">
								<li>
									<Typography>{translator.t('updates.bullet-1')}</Typography>
								</li>
								<li>
									<Typography>{translator.t('updates.bullet-2')}</Typography>
								</li>
								<li>
									<Typography>{translator.t('updates.bullet-3')}</Typography>
								</li>
							</ul>
						</div>
						<Typography className="mt-4">{translator.t('updates.description-2')}</Typography>
						<hr className="bg-border my-8 h-px border-0" />
						<Typography>{translator.t('updates.description-3')}</Typography>
						<Link
							href={`/${lang}/${region}/about-us#team`}
							className="hover:bg-muted mt-4 flex items-center rounded-full p-2"
						>
							<Image
								alt="Avatar"
								src={aurelieImage}
								width={40}
								height={40}
								className="mr-1 h-10 w-10 rounded-full object-cover transition-transform duration-300"
							/>
							<Typography className="pl-2" size="lg">
								{translator.t('updates.author-name')}, {translator.t('updates.author-city')}
							</Typography>
						</Link>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<div className="card theme-blue w-full space-y-4 rounded-xl p-6">
						<Typography size="2xl" weight="medium">
							{translator.t('updates.form-title')}
						</Typography>
						<SubscriptionInfoForm
							lang={lang}
							region={region}
							translations={{
								firstname: translator.t('updates.firstname'),
								email: translator.t('updates.email'),
								submitButton: translator.t('updates.submit-button'),
								toastMessage: translator.t('updates.newsletter-updated-toast'),
								toastErrorMessage: translator.t('updates.newsletter-error-toast'),
							}}
						/>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
