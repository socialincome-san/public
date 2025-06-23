import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Card, Badge, linkCn } from '@socialincome/ui';

type DoNoHarmContent = {
	"subtitle-principle": string;
	"subtitle-implementation": string;
	sections: {
		title: string;
		cards: {
			description: string;
			implementation: string;
			links: { label: string; url: string }[];
		}[];
	}[];
};

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-do-no-harm'] });

	const data = translator.t('content') as DoNoHarmContent;

	return (
		<BaseContainer className="items-start flex flex-col space-y-8 pt-16">
			<div>
				<Typography as="h1" size="5xl" weight="bold">
					{translator.t('content.title')}
				</Typography>
			</div>
			<div className="flex flex-col md:flex-row gap-6 w-full">
				<div className="w-full md:w-1/2">
					<Typography size="2xl" weight="medium">
						{translator.t('content.lead')}
					</Typography>
				</div>
				<div className="w-full md:w-1/2">
					<div>
						<Typography size="lg">
							{translator.t('content.lead-implementation')}
						</Typography>
					</div>
					<div className="flex flex-row flex-wrap items-center gap-4 pt-4">
						<Badge variant="outline" className="whitespace-nowrap shrink-0">
							<Typography size="sm">
								{translator.t('content.version')}
							</Typography>
						</Badge>
						<Typography size="md" className="whitespace-nowrap">
							{translator.t('content.responsible')}{' '}
							<a
								href="https://socialincome.org/about-us#team"
								target="_blank"
								rel="noopener noreferrer"
								className={linkCn({
									arrow: 'external',
									underline: 'none',
									size: 'md',
								})}
							>
								Willemijn de Gaay Fortman
							</a>
						</Typography>
					</div>
				</div>
			</div>

			{data.sections.map((section, sectionIndex) => (
				<div key={sectionIndex} className="w-full space-y-8">
					<Typography as="h2" size="3xl" className="pt-6">
						{section.title}
					</Typography>

					{section.cards.map((card, cardIndex) => (
						<Card key={cardIndex} className="w-full p-6">
							<div className="flex flex-col md:flex-row gap-6">
								<div className="w-full md:w-1/2 space-y-3">
									<div className="space-y-1">
										<Typography color="secondary" size="md">
											{data["subtitle-principle"]}
										</Typography>
										<Typography size="lg">{card.description}</Typography>
									</div>
								</div>

								<div className="w-full md:w-1/2 space-y-3">
									<div className="space-y-1">
										<Typography color="secondary" size="md">
											{data["subtitle-implementation"]}
										</Typography>
										<Typography size="lg">{card.implementation}</Typography>
									</div>

									<div className="mt-2 space-x-3">
										{card.links.map((link, linkIndex) => (
											<a
												key={linkIndex}
												href={link.url}
												className={linkCn({
													arrow: 'external',
													underline: 'none',
													size: 'md',
												})}
											>
												{link.label}
											</a>
										))}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			))}
		</BaseContainer>
	);
}