import type { BreadcrumbLink } from '@/components/breadcrumb/build-breadcrumb-links';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Breadcrumb as BreadcrumbNav } from '@socialincome/design-system/navigation/breadcrumb/breadcrumb';
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

export const Breadcrumb = ({ links, layout = 'page', aside }: Props) => {
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
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			{layout === 'page' ? <div className="py-9">{nav}</div> : nav}
		</BlockWrapper>
	);
};
