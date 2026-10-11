import { Breadcrumb, type BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';

export const JournalBreadcrumb = ({ links }: { links: BreadcrumbLinkType[] }) => (
	<div className="mb-8">
		<Breadcrumb links={links} layout="inline" />
	</div>
);
