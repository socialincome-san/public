import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-videos'],
	});

	return (
		<BaseContainer className="items-left flex flex-col space-y-8 pt-16">
			<Typography size="3xl" weight="bold">
				{translator.t('recipients.credits') + ': '}
			</Typography>
		</BaseContainer>
	);
}
