import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, linkCn, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';
import Applestore from './(assets)/applestore.svg';
import Playstore from './(assets)/playstore.svg';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-app'] });

	return (
		<BaseContainer className="flex flex-col items-start space-y-8">
			<div className="flex flex-col space-y-8">
				<Typography as="h1" size="5xl" weight="bold" className="mx-auto text-center">
					{translator.t('title')}
				</Typography>
				<Typography as="h2" size="xl" className="mx-auto w-2/3 text-center">
					{translator.t('subtitle')}
				</Typography>
			</div>
			<div className="container mx-auto pt-1 pb-24 md:pt-6">
				<div className="flex flex-col md:flex-row">
					<div className="m-2 flex flex-col items-center justify-center p-4 md:w-1/2">
						<Typography as="h2" size="xl" className="pb-4">
							{translator.t('android')}
						</Typography>
						<Link
							className={linkCn()}
							href="https://play.google.com/store/apps/details?id=org.socialincome.app"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image src={Playstore} width={150} height={50} alt="Playstore Button" />
						</Link>
					</div>
					<div className="m-2 flex flex-col items-center justify-center p-4 md:w-1/2">
						<Typography as="h2" size="xl" className="pb-4">
							{translator.t('apple')}
						</Typography>
						<Link
							className={linkCn()}
							href="https://apps.apple.com/app/social-income/id6444860109"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image src={Applestore} width={150} height={50} alt="Appstore Button" />
						</Link>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
