import { defaultLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

type Props = {
	label: string;
	pathname: string;
};

const toDefaultLanguagePath = (pathname: string) => {
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length < 2) {
		return `/${defaultLanguage}/int`;
	}
	segments[0] = defaultLanguage;

	return `/${segments.join('/')}`;
};

export const MoreArticlesButton = ({ label, pathname }: Props) => (
	<div className="mt-10 flex justify-center">
		<Button asChild variant="outline">
			<Link href={toDefaultLanguagePath(pathname)}>{label}</Link>
		</Button>
	</div>
);
