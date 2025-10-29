import { DefaultParams } from '@/app/[lang]/[region]';
import { Badge, Card, CardHeader, CardTitle, CardContent, CardFooter, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, Separator, Typography } from '@socialincome/ui';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export async function PartnershipModels({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div>
			<div className="mx-auto mb-8 mt-20 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-3/5">
				<Typography weight="medium" className="mb-12 text-center text-3xl sm:text-4xl md:text-4xl leading-loose">
					{translator.t('partnership-models.title')}
				</Typography>
			</div>
			<div className="w-full max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Card 1 */}
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('partnership-models.card-1-title')}
									</Typography>
								</CardTitle>
							</CardHeader>

							<Separator className="bg-primary mt-4 bg-opacity-30" />

							<CardContent className="my-4 p-0">
								<Typography size="lg">
									{translator.t('partnership-models.card-1-description')}
								</Typography>
							</CardContent>
							<CardFooter className="p-0 pt-2 flex flex-wrap gap-2">
								<Badge variant="interactive">{translator.t('partnership-models.badge-microsoft')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-google')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-github')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-jetbrains')}</Badge>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background h-[70vh] w-11/12 overflow-y-auto rounded-3xl border-none p-6 sm:min-w-[500px] md:min-w-[650px]">
						<DialogHeader>
							<DialogTitle>
								<Typography size="3xl" weight="medium">
									{translator.t('partnership-models.card-2-title')}
								</Typography>
							</DialogTitle>
						</DialogHeader>
						<div className="mt-4 space-y-4">
							<Typography size="lg">
								Placeholder content for the first dialog body.
							</Typography>
							<Typography size="lg">
								More placeholder text to demonstrate scrolling inside the dialog.
							</Typography>
						</div>
					</DialogContent>
				</Dialog>

				{/* Card 2 */}
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('partnership-models.card-2-title')}
									</Typography>
								</CardTitle>
							</CardHeader>
							<Separator className="bg-primary mt-4 bg-opacity-30" />
							<CardContent className="my-4 p-0">
								<Typography size="lg">
									{translator.t('partnership-models.card-2-description')}
								</Typography>
							</CardContent>
							<CardFooter className="p-0 pt-2 flex flex-wrap gap-2">
								<Badge variant="interactive">{translator.t('partnership-models.badge-microsoft')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-google')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-github')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-jetbrains')}</Badge>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background h-[70vh] w-11/12 overflow-y-auto rounded-3xl border-none p-6 sm:min-w-[500px] md:min-w-[650px]">
						<DialogHeader>
							<DialogTitle>
								<Typography size="3xl" weight="medium">
									{translator.t('partnership-models.card-2-title')}
								</Typography>
							</DialogTitle>
						</DialogHeader>
						<div className="mt-4 space-y-4">
							<Typography size="lg">
								Placeholder content for the second dialog body.
							</Typography>
							<Typography size="lg">
								More placeholder text to demonstrate scrolling inside the dialog.
							</Typography>
						</div>
					</DialogContent>
				</Dialog>

				{/* Card 3 */}
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('partnership-models.card-3-title')}
									</Typography>
								</CardTitle>
							</CardHeader>
							<Separator className="bg-primary mt-4 bg-opacity-30" />
							<CardContent className="my-4 p-0">
								<Typography size="lg">
									{translator.t('partnership-models.card-3-description')}
								</Typography>
							</CardContent>
							<CardFooter className="p-0 pt-2">
								<Typography size="sm">{translator.t('partnership-models.card-3-footnote')}</Typography>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background h-[70vh] w-11/12 overflow-y-auto rounded-3xl border-none p-6 sm:min-w-[500px] md:min-w-[650px]">
						<DialogHeader>
							<DialogTitle>
								<Typography size="3xl" weight="medium">
									{translator.t('partnership-models.card-3-title')}
								</Typography>
							</DialogTitle>
						</DialogHeader>
						<div className="mt-4 space-y-4">
							<Typography size="lg">
								{translator.t('partnership-models.card-3-dialog-sub')}
							</Typography>
						</div>
					</DialogContent>
				</Dialog>

				{/* Card 4 */}
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('partnership-models.card-4-title')}
									</Typography>
									<Badge size="md" variant="interactive-accent">{translator.t('partnership-models.badge')}</Badge>
								</CardTitle>
							</CardHeader>
							<Separator className="bg-primary mt-4 bg-opacity-30" />
							<CardContent className="my-4 p-0">
								<Typography size="lg">
									{translator.t('partnership-models.card-4-description')}
								</Typography>
							</CardContent>
							<CardFooter className="p-0 pt-2">
								<Typography size="sm">{translator.t('partnership-models.card-4-footnote')}</Typography>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background h-[70vh] w-11/12 overflow-y-auto rounded-3xl border-none p-6 sm:min-w-[500px] md:min-w-[650px]">
						<DialogHeader>
							<DialogTitle>
								<Typography size="3xl" weight="medium">
									{translator.t('partnership-models.card-4-title')}
								</Typography>
							</DialogTitle>
						</DialogHeader>
						<div className="mt-4 space-y-4">
							<Typography size="lg">
								Placeholder content for the fourth dialog body.
							</Typography>
							<Typography size="lg">
								More placeholder text to demonstrate scrolling inside the dialog.
							</Typography>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}