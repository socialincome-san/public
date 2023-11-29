import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SectionCard, TabTranslation } from '@/app/[lang]/[region]/(website)/transparency/sustainability/section-card';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Tabs, TabsContent, TabsList, TabsTrigger, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-sustainability'],
	});
	const tabs = translator.t<TabTranslation[]>(`section-2.tabs`);

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col	space-y-12 pb-16">
			<div className="space-y-4">
				<Typography as="h1" size="4xl" weight="bold">
					{translator.t('section-1.title')}
				</Typography>
				<Typography as="h2" size="2xl" weight="medium">
					{translator.t('section-1.subtitle')}
				</Typography>
			</div>
			<Tabs defaultValue={tabs[0].trigger} className="theme-white mx-auto flex w-full flex-col rounded-lg">
				<TabsList className="mb-10">
					{tabs.map((tab, key) => {
						return (
							<TabsTrigger value={tab.trigger} key={key}>
								{tab.trigger}
							</TabsTrigger>
						);
					})}
				</TabsList>
				{tabs.map((tab, key) => {
					return (
						<TabsContent value={tab.trigger} key={key}>
							<SectionCard tab={tab} />
						</TabsContent>
					);
				})}
			</Tabs>
		</BaseContainer>
	);
}
