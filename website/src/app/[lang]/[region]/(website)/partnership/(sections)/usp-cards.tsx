import { CardContent, CardHeader, GlowHoverCard, Typography } from '@socialincome/ui';
import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function UspCards({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (

	<div className="pt-10 flex flex-col items-center">
		<Typography size="3xl" weight="medium" className="mb-12 text-center">
			{translator.t('content.section-title-1')}
		</Typography>

		<div className="w-full max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2">
			<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
				<CardHeader className="mt-3 ml-4">
					<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-1')}</Typography>
				</CardHeader>
				<CardContent className="mb-5 ml-4">
					<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-1')}</Typography>
				</CardContent>
			</GlowHoverCard>

			<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
				<CardHeader className="mt-3 ml-4">
					<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-2')}</Typography>
				</CardHeader>
				<CardContent className="mb-5 ml-4">
					<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-2')}</Typography>
				</CardContent>
			</GlowHoverCard>

			<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
				<CardHeader className="mt-3 ml-4">
					<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-3')}</Typography>
				</CardHeader>
				<CardContent className="mb-5 ml-4">
					<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-3')}</Typography>
				</CardContent>
			</GlowHoverCard>

			<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
				<CardHeader className="mt-3 ml-4">
					<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-4')}</Typography>
				</CardHeader>
				<CardContent className="mb-5 ml-4">
					<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-4')}</Typography>
				</CardContent>
			</GlowHoverCard>
		</div>
	</div>
	);
}



