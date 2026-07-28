import { Breadcrumb, type BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { cn } from '@/lib/utils/cn';

export const JournalBreadcrumb = ({ links, className }: { links: BreadcrumbLinkType[]; className?: string }) => (
	<Breadcrumb links={links} className={cn('py-0', className)} />
);
