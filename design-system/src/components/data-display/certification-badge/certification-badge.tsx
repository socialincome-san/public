import NextImage from 'next/image';

type CertificationBadgeProps = {
	label: string;
	// The certifier's seal, shown next to the label
	imageSrc: string;
	href: string;
};

export const CertificationBadge = ({ label, imageSrc, href }: CertificationBadgeProps) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className="text-foreground focus-visible:ring-ring inline-flex items-center gap-3 rounded-full text-sm font-medium hover:underline focus-visible:ring-1 focus-visible:outline-hidden"
	>
		<NextImage src={imageSrc} alt="" width={36} height={36} className="size-9 shrink-0" />
		{label}
	</a>
);
