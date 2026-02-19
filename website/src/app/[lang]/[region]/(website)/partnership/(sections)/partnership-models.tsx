import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Separator,
	Typography,
} from '@socialincome/ui';

export const PartnershipModels = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-partnership'],
	});

	return (
		<div>
			<div className="mx-auto mb-8 mt-20 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-3/5">
				<Typography weight="medium" className="mb-12 text-center text-3xl sm:text-4xl md:text-4xl">
					{translator.t('partnership-models.title')}
				</Typography>
			</div>
			<div className="grid w-full max-w-7xl grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
				{/* Card 1 */}
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('partnership-models.card-4-title')}
									</Typography>
									<Badge size="md" variant="interactive-accent">
										{translator.t('partnership-models.badge')}
									</Badge>
								</CardTitle>
							</CardHeader>
							<Separator className="bg-primary mt-4 bg-opacity-30" />
							<CardContent className="my-4 p-0">
								<Typography size="lg">{translator.t('partnership-models.card-4-description')}</Typography>
							</CardContent>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background h-[70vh] w-full max-w-6xl overflow-y-auto rounded-3xl border-none p-6">
						<DialogHeader>
							<DialogTitle>
								<Typography size="3xl" weight="medium">
									{translator.t('partnership-models.card-4-title')}
								</Typography>
							</DialogTitle>
						</DialogHeader>

						<div className="mt-4 overflow-x-auto">
							<table className="text-md w-full min-w-[1000px] max-w-none table-auto border-collapse text-left">
								<thead>
									<tr className="border-b">
										<th className="px-4 py-2 font-semibold">
											{translator.t('partnership-models.card-4-dialog-header-1')}
										</th>
										<th className="px-4 py-2 font-semibold">
											{translator.t('partnership-models.card-4-dialog-header-2')}
										</th>
										<th className="px-4 py-2 font-semibold">
											{translator.t('partnership-models.card-4-dialog-header-3')}
										</th>
										<th className="px-4 py-2 font-semibold">
											{translator.t('partnership-models.card-4-dialog-header-4')}
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-muted border-b">
										<td className="px-4 py-2 font-bold">{translator.t('partnership-models.card-4-dialog-row-1a')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-1b')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-1c')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-1d')}</td>
									</tr>
									<tr className="border-muted border-b">
										<td className="px-4 py-2 font-bold">{translator.t('partnership-models.card-4-dialog-row-2a')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-2b')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-2c')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-2d')}</td>
									</tr>
									<tr>
										<td className="px-4 py-2 font-bold">{translator.t('partnership-models.card-4-dialog-row-3a')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-3b')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-3c')}</td>
										<td className="px-4 py-2">{translator.t('partnership-models.card-4-dialog-row-3d')}</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="mt-6 flex justify-end">
							<a href="mailto:hello@socialincome.org?subject=Partner%27s%20Circle">
								<Button>{translator.t('partnership-models.card-4-dialog-button')}</Button>
							</a>
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
								<Typography size="lg">{translator.t('partnership-models.card-2-description')}</Typography>
							</CardContent>
							<CardFooter className="flex flex-wrap gap-2 p-0 pt-2">
								<Badge variant="interactive">{translator.t('partnership-models.badge-google')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-github')}</Badge>
								<Badge variant="interactive">{translator.t('partnership-models.badge-jetbrains')}</Badge>
								<Badge variant="interactive">...</Badge>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background flex h-[40vh] w-11/12 flex-col rounded-3xl border-none p-0 sm:min-w-[500px] md:min-w-[650px]">
						{/* Scrollable content area */}
						<div className="flex-1 overflow-y-auto px-6 pt-6">
							<DialogHeader>
								<DialogTitle>
									<Typography size="3xl" weight="medium">
										{translator.t('partnership-models.card-2-title')}
									</Typography>
								</DialogTitle>
							</DialogHeader>
							<div className="mt-4">
								<Typography size="xl">{translator.t('partnership-models.card-2-dialog-text')}</Typography>
							</div>
						</div>

						{/* Fixed button footer */}
						<div className="border-muted border-t px-6 py-4">
							<div className="flex justify-end">
								<a href="mailto:hello@socialincome.org?subject=In-Kind%20Donation">
									<Button>{translator.t('partnership-models.card-4-dialog-button')}</Button>
								</a>
							</div>
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
								<Typography size="lg">{translator.t('partnership-models.card-3-description')}</Typography>
							</CardContent>
							<CardFooter className="p-0 pt-2">
								<Typography size="sm">{translator.t('partnership-models.card-3-footnote')}</Typography>
							</CardFooter>
						</Card>
					</DialogTrigger>

					<DialogContent className="bg-background flex h-[40vh] w-11/12 flex-col rounded-3xl border-none p-0 sm:min-w-[500px] md:min-w-[650px]">
						{/* Scrollable content area */}
						<div className="flex-1 overflow-y-auto px-6 pt-6">
							<DialogHeader>
								<DialogTitle>
									<Typography size="3xl" weight="medium">
										{translator.t('partnership-models.card-3-title')}
									</Typography>
								</DialogTitle>
							</DialogHeader>
							<div className="mt-4">
								<Typography size="xl">{translator.t('partnership-models.card-3-dialog-text')}</Typography>
							</div>
						</div>

						{/* Fixed button footer */}
						<div className="border-muted border-t px-6 py-4">
							<div className="flex justify-end">
								<a href="https://socialincome.org/newsletter">
									<Button>{translator.t('partnership-models.card-3-dialog-button')}</Button>
								</a>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
