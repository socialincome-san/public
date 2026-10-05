import Image from 'next/image';
import Link from 'next/link';

type PartnershipBadgeProps = {
	name: string;
	href: string;
	logoSrc?: string;
	logoAlt?: string;
};

export const PartnershipBadge = ({ name, href, logoSrc, logoAlt }: PartnershipBadgeProps) => {
	const accessibleLogoAlt = logoAlt?.trim().length ? logoAlt.trim() : `${name} logo`;

	return (
		<Link
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-100 py-0 pr-4 pl-3 shadow-sm"
		>
			{logoSrc && (
				<span className="flex size-8 shrink-0 items-center justify-center">
					<Image src={logoSrc} alt={accessibleLogoAlt} width={24} height={24} className="size-6 object-contain" />
				</span>
			)}
			<span className="text-foreground text-sm leading-5 font-medium whitespace-nowrap">{name}</span>
		</Link>
	);
};
