import { Slot } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const BreadcrumbElements = React.forwardRef<HTMLElement, WithoutClassName<React.ComponentPropsWithoutRef<'nav'>>>(
	(props, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />,
);
BreadcrumbElements.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, WithoutClassName<React.ComponentPropsWithoutRef<'ol'>>>(
	(props, ref) => (
		<ol
			ref={ref}
			className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5"
			{...props}
		/>
	),
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, WithoutClassName<React.ComponentPropsWithoutRef<'li'>>>(
	(props, ref) => <li ref={ref} className="inline-flex items-center gap-1.5" {...props} />,
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	WithoutClassName<React.ComponentPropsWithoutRef<'a'>> & {
		asChild?: boolean;
	}
>(({ asChild, ...props }, ref) => {
	const Comp = asChild ? Slot : 'a';

	return <Comp ref={ref} className="hover:text-foreground transition-colors" {...props} />;
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbSeparator = ({ children, ...props }: WithoutClassName<React.ComponentProps<'li'>>) => (
	<li role="presentation" aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5" {...props}>
		{children ?? <ChevronRight />}
	</li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

export { BreadcrumbElements, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator };
