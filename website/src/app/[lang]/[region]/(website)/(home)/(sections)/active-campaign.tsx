import { WebsiteLanguage } from '@/i18n';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Typography } from '@socialincome/ui';

export async function Campaign({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-donate'],
	});

	return (
		<BaseContainer className="flex cursor-pointer flex-col items-center justify-center">
			<a
				href="https://socialincome.org/campaign/MZmXEVHlDjOOFOMk82jW"
				target="_blank"
				rel="noopener noreferrer"
				className="group"
			>
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
						Rebuilding Lives by Ismatu&nbsp;Gwendolyn
					</Typography>
				</Badge>
			</a>
		</BaseContainer>
	);
}
