import type { BreadcrumbLink } from '@/components/breadcrumb/build-breadcrumb-links';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import { Breadcrumb as BreadcrumbNav } from '@socialincome/design-system/breadcrumb/breadcrumb';
import { cn } from '@socialincome/design-system/cn';

export type { BreadcrumbLink as BreadcrumbLinkType } from '@/components/breadcrumb/build-breadcrumb-links';

export const Breadcrumb = ({ links, className }: { links: BreadcrumbLink[]; className?: string }) => {
	return (
		<BlockWrapper className={cn('py-9', className)} disableMarginTop={true} disableMarginBottom={true}>
			<BreadcrumbNav links={links} />
		</BlockWrapper>
	);
};
