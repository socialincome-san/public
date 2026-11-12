import type { BreadcrumbLink } from '@/components/breadcrumb/build-breadcrumb-links';
import { chicagoTitleCase } from '@/lib/utils/string-utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Breadcrumb as BreadcrumbNav } from '@socialincome/design-system/navigation/breadcrumb/breadcrumb';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';

export type { BreadcrumbLink as BreadcrumbLinkType } from '@/components/breadcrumb/build-breadcrumb-links';

type Props = {
	links: BreadcrumbLink[];
	/**
	 * page: its own padded block at the top of a page.
	 * section: aligned to the content width, spaced by the surrounding layout.
	 * inline: just the links, inside an existing content column.
	 */
	layout?: 'page' | 'section' | 'inline';
	aside?: ReactNode;
};

// Chicago title case is an English rule; other languages only get a capital first letter
const formatLabel = (label: string, locale: string) =>
	locale === 'en' ? chicagoTitleCase(label) : label.charAt(0).toUpperCase() + label.slice(1);

export const Breadcrumb = ({ links: rawLinks, layout = 'page', aside }: Props) => {
	const locale = useLocale();
	const links = rawLinks.map((link) => ({ ...link, label: formatLabel(link.label, locale) }));
	const nav = aside ? (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<BreadcrumbNav links={links} />
			{aside}
		</div>
	) : (
		<BreadcrumbNav links={links} />
	);

	if (layout === 'inline') {
		return nav;
	}

	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			{layout === 'page' ? <div className="py-9">{nav}</div> : nav}
		</BlockWrapper>
	);
};
