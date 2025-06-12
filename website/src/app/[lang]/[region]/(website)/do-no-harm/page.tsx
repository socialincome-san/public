import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Card, linkCn } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-do-no-harm'] });

	return (
		<BaseContainer className="items-start flex flex-col space-y-8 pt-16">
			<div>
				<Typography as="h1" size="5xl" weight="bold" className="mx-auto text-center">
					{translator.t('title')}
				</Typography>
			</div>
			<div>
				<Typography as="h2" size="3xl" weight="bold">
					{translator.t('chapter-1')}
				</Typography>
			</div>

			<Card className="w-full p-6">
				<div className="flex flex-col md:flex-row gap-6">
					<div className="w-full md:w-1/2 space-y-3">
						<div className="space-y-1">
							<Typography color="secondary" size="md">
									{translator.t('best-practice')}
							</Typography>
							<Typography size="lg">
								{translator.t('principle-1')}
							</Typography>
						</div>
					</div>
					<div className="w-full md:w-1/2 space-y-3">
						<div className="space-y-1">
							<Typography color="secondary" size="md">
								{translator.t('implementation')}
							</Typography>
							<Typography size="lg">
								{translator.t('principle-1-si')}
							</Typography>
						</div>
						<div className="mt-2 space-x-3">
							<a href="#" className={linkCn({
								arrow: 'external',
								underline: 'none',
								size: 'md'
							})}>
								Local partners
							</a>
							<a href="#" className={linkCn({
								arrow: 'external',
								underline: 'none',
								size: 'md'
							})}>
								Local employees
							</a>
						</div>
					</div>
				</div>
			</Card>

			{/* Row 2 */}
			<div className="w-full flex flex-col md:flex-row border p-4 rounded-lg gap-4">
				<div className="w-full md:w-1/2  p-2">Div A - Row 2</div>
				<div className="w-full md:w-1/2  p-2">Div Info - Row 2</div>
			</div>

			{/* Row 3 with links */}
			<div className="w-full flex flex-col md:flex-row border p-4 rounded-lg gap-4">
				<div className="w-full md:w-1/2  p-2">Div A - Row 3</div>
				<div className="w-full md:w-1/2  p-2">
					Div Info - Row 3
					<div className="mt-2 space-x-2">
						<a href="#" className="text-blue-600 underline">Link 1</a>
						<a href="#" className="text-blue-600 underline">Link 2</a>
					</div>
				</div>
			</div>

			{/* Continue for Rows 4 to 10 similarly... */}
		</BaseContainer>
	);
}
