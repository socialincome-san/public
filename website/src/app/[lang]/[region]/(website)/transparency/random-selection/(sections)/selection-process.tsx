import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function SelectionProcess({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-selection'],
	});

	return (
		<BaseContainer className="mt-20 flex flex-col gap-10 md:flex-row">
			<div className="flex flex-col gap-4 md:w-1/2">
				<div className="bg-foreground flex items-center gap-4 rounded-lg p-4 outline-1">
					<div className="bg-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-lg text-white">
						1
					</div>
					<div>
						<Typography weight="medium" size="xl" className="text-accent mb-2">
							{translator.t('section-3.preselection-title')}
						</Typography>
						<Typography size="xl" className="text-white">
							{translator.t('section-3.preselection-subtitle')}
						</Typography>
					</div>
				</div>
				<div className="bg-background border-bg-muted-foreground flex items-center gap-4 rounded-lg border-2 p-4">
					<div className="bg-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-lg text-white opacity-20">
						2
					</div>
					<div>
						<Typography weight="medium" size="xl" className="mb-2">
							{translator.t('section-3.selection-title')}
						</Typography>
						<Typography size="xl">{translator.t('section-3.selection-subtitle')}</Typography>
					</div>
				</div>
			</div>

			<div className="space-y-4 md:w-1/2">
				<div>
					<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
						{translator.t('section-3.preselection-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.preselection-goal')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.preselection-1-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-1-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.preselection-1-annex')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.preselection-2-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-2-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.preselection-2-annex')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.preselection-3-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-3-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.preselection-3-annex')}</Typography>
				</div>

				<div className="pt-8">
					<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
						{translator.t('section-3.selection-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.selection-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.selection-goal')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.selection-1-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.selection-1-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.selection-1-annex')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.selection-2-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.selection-2-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.selection-2-annex')}</Typography>
				</div>
				<div>
					<Typography weight="medium" className="text-accent mb-2 text-xl">
						{translator.t('section-3.selection-3-title')}
					</Typography>
					<Typography className="mb-4 text-xl">{translator.t('section-3.selection-3-desc')}</Typography>
					<Typography className="text-md mb-6">{translator.t('section-3.selection-3-annex')}</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
