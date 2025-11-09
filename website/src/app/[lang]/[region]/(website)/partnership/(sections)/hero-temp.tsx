import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, linkCn, Typography } from '@socialincome/ui';

export async function HeroTemp({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div className="space-y-6">
			<Typography as="h1" size="5xl" weight="bold">
				{translator.t('content.title')}
			</Typography>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Typography size="2xl" weight="medium">
					{translator.t('content.lead')}
				</Typography>

				<div>
					<Typography size="lg">{translator.t('content.lead-implementation')}</Typography>
					<div className="mt-4 flex flex-wrap items-center gap-4">
						<Badge variant="outline" className="shrink-0">
							<Typography size="sm">{translator.t('content.version')}</Typography>
						</Badge>

						<Typography size="md" className="whitespace-nowrap">
							{translator.t('content.responsible')}{' '}
							<a
								href="https://socialincome.org/about-us#team"
								target="_blank"
								rel="noopener noreferrer"
								className={linkCn({ arrow: 'external', underline: 'none', size: 'md' })}
							>
								xxx
							</a>
						</Typography>
					</div>
				</div>
			</div>
		</div>
	);
}
