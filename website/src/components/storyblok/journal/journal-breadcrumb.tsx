import { Breadcrumb, type BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';

export const JournalBreadcrumb = ({ links }: { links: BreadcrumbLinkType[] }) => (
	<Breadcrumb links={links} className="py-0" />
);
