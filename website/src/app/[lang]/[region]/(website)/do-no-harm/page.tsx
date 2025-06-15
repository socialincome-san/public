import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Card, linkCn } from '@socialincome/ui';

// Types for the content
type DoNoHarmContent = {
	title: string;
	lead: string;
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

	// Load content from i18n
	const data = translator.t('content') as DoNoHarmContent;

	return (
		<BaseContainer className="items-start flex flex-col space-y-8 pt-16">
			<div>
				<Typography as="h1" size="5xl" weight="bold">
					{data.title}
				</Typography>
			</div>

			<Typography size="lg">
				{data.lead}
			</Typography>

			{data.sections.map((section, sectionIndex) => (
				<div key={sectionIndex} className="w-full space-y-6">
					<Typography as="h2" size="3xl">
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