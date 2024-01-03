'use client';

import ismatuImage from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/ismatu-gwendolyn.jpeg';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image from 'next/image';

export async function CampaignCard({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="p-0">
			<div className="bg-primary relative w-full rounded-lg p-8">
				<div className="bg-primary-foreground-muted mb-4 inline-block rounded-full px-3 py-1 md:absolute md:right-8 md:top-8">
					<div className="text-md text-primary">25 days left</div>
				</div>

				<div className="mb-4 flex">
					<div className="mr-4 h-24 w-24 overflow-hidden rounded-full">
						<Image src={ismatuImage} alt="Ismatu Bangura" width={100} height={100} />
					</div>
					<div className="flex-grow">
						<div>
							<Typography size="2xl" className="text-primary-foreground">
								Ismatu Bangura
							</Typography>
						</div>
						<div>
							<Typography size="2xl" className="text-accent">
								is raising USD 200,000
							</Typography>
						</div>
						<div>
							<Typography size="2xl" className="text-primary-foreground">
								for survivors of Ebola
							</Typography>
						</div>
					</div>
				</div>

				{/* Progress bar placeholder */}
				<div className="bg-primary-foreground-muted my-8 w-full rounded-lg">
					<div className="text-accent-foreground py-1 text-center">Placeholder for progress bar</div>
				</div>

				{/* Text below the progress bar */}
				<div className="flex flex-col justify-between md:flex-row">
					<div className="flex items-center">
						<Typography size="md" className="text-primary-foreground mb-2 mr-2 md:mb-0">
							USD 1000 raised
						</Typography>
						<Typography size="md" className="text-accent mb-2 md:mb-0">
							2%
						</Typography>
					</div>
					<div>
						<Typography size="md" className="text-primary-foreground">
							34 people donated
						</Typography>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
