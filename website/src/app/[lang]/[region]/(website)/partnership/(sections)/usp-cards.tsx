import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { CardContent, CardHeader, GlowHoverCard, Typography } from '@socialincome/ui';

export async function UspCards({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div className="flex flex-col items-center py-10">
			<Typography size="4xl" weight="medium" className="mb-12 text-center">
				{translator.t('usp.section-title-1')}
			</Typography>
			<div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
				<GlowHoverCard className="theme-blue overflow-hidden rounded-2xl border-none">
					<CardHeader className="ml-4 mt-3">
						<Typography size="2xl" weight="medium" color="accent">
							{translator.t('usp.reason-title-1')}
						</Typography>
					</CardHeader>
					<CardContent className="mb-5 ml-4">
						<Typography size="lg" className="opacity-80">
							{translator.t('usp.reason-description-1')}
						</Typography>
					</CardContent>
				</GlowHoverCard>

				<GlowHoverCard className="theme-blue overflow-hidden rounded-2xl border-none">
					<CardHeader className="ml-4 mt-3">
						<Typography size="2xl" weight="medium" color="accent">
							{translator.t('usp.reason-title-2')}
						</Typography>
					</CardHeader>
					<CardContent className="mb-5 ml-4">
						<Typography size="lg" className="opacity-80">
							{translator.t('usp.reason-description-2')}
						</Typography>
					</CardContent>
				</GlowHoverCard>

				<GlowHoverCard className="theme-blue overflow-hidden rounded-2xl border-none">
					<CardHeader className="ml-4 mt-3">
						<Typography size="2xl" weight="medium" color="accent">
							{translator.t('usp.reason-title-3')}
						</Typography>
					</CardHeader>
					<CardContent className="mb-5 ml-4">
						<Typography size="lg" className="opacity-80">
							{translator.t('usp.reason-description-3')}
						</Typography>
					</CardContent>
				</GlowHoverCard>

				<GlowHoverCard className="theme-blue overflow-hidden rounded-2xl border-none">
					<CardHeader className="ml-4 mt-3">
						<Typography size="2xl" weight="medium" color="accent">
							{translator.t('usp.reason-title-4')}
						</Typography>
					</CardHeader>
					<CardContent className="mb-5 ml-4">
						<Typography size="lg" className="opacity-80">
							{translator.t('usp.reason-description-4')}
						</Typography>
					</CardContent>
				</GlowHoverCard>
			</div>
		</div>
	);
}
