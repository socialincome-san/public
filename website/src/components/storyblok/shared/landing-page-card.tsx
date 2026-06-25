import NextImage from 'next/image';
import NextLink from 'next/link';
import { ReactNode } from 'react';

type Stat = {
	value: number;
	label: string;
};

type Props = {
	href: string;
	title: string;
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: Stat[];
	titleVisual?: ReactNode;
};

export const LandingPageCard = ({ href, title, heroImageFilename, heroImageAlt, stats, titleVisual }: Props) => {
	return (
		<li className="bg-foreground overflow-hidden rounded-3xl border">
			<NextLink href={href} className="group block">
				<div className="bg-foreground relative aspect-[16/10]">
					{heroImageFilename && (
						<NextImage
							src={heroImageFilename}
							alt={heroImageAlt ?? title}
							fill
							className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
						/>
					)}
					<div className="from-foreground/80 via-foreground/35 to-foreground/10 absolute inset-0 bg-gradient-to-t transition-opacity duration-300 group-hover:opacity-90" />

					<div className="text-primary-foreground absolute inset-x-5 bottom-5 flex flex-col gap-3">
						<div className="flex items-center gap-3">
							{titleVisual}
							<p className="text-lg font-bold">{title}</p>
						</div>
						<div className="text-primary-foreground/90 flex flex-wrap gap-x-6 gap-y-1 text-sm">
							{stats.map((stat) => (
								<p key={stat.label} className="font-medium">
									{stat.value} {stat.label}
								</p>
							))}
						</div>
					</div>
				</div>
			</NextLink>
		</li>
	);
};
