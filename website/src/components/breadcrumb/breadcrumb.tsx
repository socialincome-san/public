import type { BreadcrumbLink } from '@/components/breadcrumb/build-breadcrumb-links';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Breadcrumb as BreadcrumbNav } from '@socialincome/design-system/navigation/breadcrumb/breadcrumb';

export type { BreadcrumbLink as BreadcrumbLinkType } from '@/components/breadcrumb/build-breadcrumb-links';

type Props = {
	links: BreadcrumbLink[];
	/**
	 * page: its own padded block at the top of a page.
	 * section: aligned to the content width, spaced by the surrounding layout.
	 * inline: just the links, inside an existing content column.
	 */
	layout?: 'page' | 'section' | 'inline';
};

export const Breadcrumb = ({ links, layout = 'page' }: Props) => {
	if (layout === 'inline') {
		return <BreadcrumbNav links={links} />;
	}

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			{layout === 'page' ? (
				<div className="py-9">
					<BreadcrumbNav links={links} />
				</div>
			) : (
				<BreadcrumbNav links={links} />
			)}
		</BlockWrapper>
	);
};
