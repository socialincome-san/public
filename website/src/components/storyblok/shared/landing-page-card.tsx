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
		<li className="overflow-hidden rounded-3xl border bg-black">
			<NextLink href={href} className="group block">
				<div className="relative aspect-[16/10] bg-black">
					{heroImageFilename && (
						<NextImage
							src={heroImageFilename}
							alt={heroImageAlt ?? title}
							fill
							className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />

					<div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 text-white">
						<div className="flex items-center gap-3">
							{titleVisual}
							<p className="text-lg font-semibold">{title}</p>
						</div>
						<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/90">
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

