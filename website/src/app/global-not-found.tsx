import { RootDocument, rootViewport } from '@/app/root-document';
import { NotFound } from '@/components/not-found';
import { defaultLanguage } from '@/lib/i18n/utils';
import { languageNeutralImages } from '@/lib/utils/metadata';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { Metadata } from 'next';
import Link from 'next/link';

export const viewport = rootViewport;

export const metadata: Metadata = { title: 'Social Income', ...languageNeutralImages };

export default function GlobalNotFound() {
	return (
		<RootDocument lang={defaultLanguage}>
			<NotFound
				title="We could not find that page"
				description="The page may have moved, or the link may no longer be valid."
			>
				<Button asChild>
					<Link href="/">Go to homepage</Link>
				</Button>
			</NotFound>
		</RootDocument>
	);
}
