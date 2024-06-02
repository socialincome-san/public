import { DefaultParams } from '@/app/[lang]/[region]';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

export async function Campaign({ params: { lang, region } }: { params: DefaultParams }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-donate'],
	});

	return (
		<BaseContainer className="mb-8 flex flex-col items-center justify-center sm:mb-0">
			<Link href={`/${lang}/${region}/campaign/MZmXEVHlDjOOFOMk82jW`} className="group">
				<Badge variant="outline" className="flex-shrink-0">
					<Typography
						size="md"
						color="primary"
						weight="normal"
						className="group-hover:text-primary-foreground flex items-center p-1"
					>
						<BellAlertIcon className="mx-4 h-8 w-8 sm:mx-3 sm:h-5 sm:w-5" />
						{translator.t('campaign.badge-highlight')}
					</Typography>
					<Typography
						size="md"
						color="secondary"
						weight="medium"
						className="group-hover:text-primary-foreground mr-4 flex items-center p-1"
					>
						Rebuilding Lives by Ismatu Gwendolyn
					</Typography>
				</Badge>
			</Link>
		</BaseContainer>
	);
}
