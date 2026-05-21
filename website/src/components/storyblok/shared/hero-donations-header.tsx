import { MakeDonationForm } from '@/components/make-donation-form';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import NextImage from 'next/image';

type Stat = {
	value: number;
	label: string;
};

type Props = {
	lang: WebsiteLanguage;
	title: string;
	description: string;
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: Stat[];
	titleIcon?: string;
	titleIconAlt?: string;
};

export const HeroDonationsHeader = ({
	lang,
	title,
	description,
	heroImageFilename,
	heroImageAlt,
	stats,
	titleIcon,
	titleIconAlt,
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
							{titleIcon ? (
								<NextImage
									src={titleIcon}
									alt={titleIconAlt ?? title}
									width={44}
									height={32}
									className="h-8 w-auto rounded-sm"
								/>
							) : null}
							<h1 className="text-4xl font-bold xl:text-6xl">{title}</h1>
						</div>
						<div className="flex flex-col gap-1 text-xl">
							{stats.map((stat) => (
								<p key={stat.label}>
									{stat.value} {stat.label}
								</p>
							))}
						</div>
					</div>
					<div className="hidden shrink-0 lg:block">
						<MakeDonationForm lang={lang} />
					</div>
				</div>
			</div>

			<div className="flex justify-center lg:hidden">
				<MakeDonationForm lang={lang} />
			</div>
		</section>
	);
};
