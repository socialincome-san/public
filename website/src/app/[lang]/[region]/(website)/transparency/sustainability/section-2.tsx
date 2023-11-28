import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Tabs, TabsContent, TabsList, TabsTrigger, Typography } from '@socialincome/ui';
import { SectionCard, TabTranslation } from './section-card';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-sustainability'],
	});
	const tabs = translator.t<TabTranslation[]>(`section-2.tabs`);

	return (
		<BaseContainer className="mt-12 flex flex-col items-center space-y-12 text-center">
			<Tabs defaultValue={tabs[0].trigger} className="w-full">
				<TabsList className="mb-10">
					{tabs.map((tab, key) => {
						return (
							<TabsTrigger value={tab.trigger} key={key}>
								<Typography size="lg">{tab.trigger}</Typography>
							</TabsTrigger>
						);
					})}
				</TabsList>
				{tabs.map((tab, key) => {
					return (
						<TabsContent value={tab.trigger} key={key} className="flex justify-center">
							<SectionCard tab={tab} />
						</TabsContent>
					);
				})}
			</Tabs>
		</BaseContainer>
	);
}
