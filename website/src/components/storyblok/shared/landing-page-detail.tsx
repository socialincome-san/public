import NextImage from 'next/image';
import { ReactNode } from 'react';

type Stat = {
	value: number;
	label: string;
};

type Props = {
	title: string;
	description: string;
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: Stat[];
	titleVisual?: ReactNode;
	actions?: ReactNode;
	sideContent?: ReactNode;
	mobileContent?: ReactNode;
	descriptionHeading?: string;
};

export const LandingPageDetail = ({
	title,
	description,
	heroImageFilename,
	heroImageAlt,
	stats,
	titleVisual,
	actions,
	sideContent,
	mobileContent,
	descriptionHeading,
}: Props) => {
	return (
		<section className="hero-video hero-video-block flex flex-col gap-6">
			<div className="relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl bg-black md:min-h-160 md:rounded-b-[56px]">
				{heroImageFilename ? (
					<NextImage src={heroImageFilename} alt={heroImageAlt ?? title} fill className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />

				<div className="w-site-width max-w-content absolute inset-0 z-20 mx-auto flex flex-row items-center justify-between gap-4 text-white">
					<div className="flex max-w-2xl flex-col gap-4 text-white">
						<div className="flex items-center gap-4">
							{titleVisual}
							<h1 className="text-4xl font-bold xl:text-6xl">{title}</h1>
						</div>
						<div className="flex flex-col gap-1 text-xl">
							{stats.map((stat) => (
								<p key={stat.label}>
									{stat.value} {stat.label}
								</p>
							))}
						</div>
						{actions ? <div>{actions}</div> : null}
					</div>
					{sideContent ? <div className="hidden shrink-0 lg:block">{sideContent}</div> : null}
				</div>
			</div>

			{mobileContent ? <div className="flex justify-center lg:hidden">{mobileContent}</div> : null}

			<div className="w-site-width max-w-content mx-auto flex min-h-96 flex-col gap-4 px-6 py-8">
				{descriptionHeading ? <h2 className="text-2xl font-semibold">{descriptionHeading}</h2> : null}
				<p className="text-base">{description || '-'}</p>
			</div>
		</section>
	);
};

