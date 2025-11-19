'use client';
import { useI18n } from '@/lib/i18n/useI18n';
import { defaultLanguage } from '@/lib/i18n/utils';
import { Button, Typography } from '@socialincome/ui';

type MoreArticlesLinkProps = {
	text: string;
};

export function MoreArticlesLink({ text }: MoreArticlesLinkProps) {
	const setLanguage = useI18n().setLanguage;

	return (
		<Typography size="sm">
			<Button variant="link" onClick={() => setLanguage(defaultLanguage)}>
				{text}
			</Button>
		</Typography>
	);
}
