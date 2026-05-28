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
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: Stat[];
	titleIcon?: string;
	titleIconAlt?: string;
	showDonationForm?: boolean;
};

export const HeroDonationsHeader = ({
	lang,
	title,
	heroImageFilename,
	heroImageAlt,
	stats,
	titleIcon,
	titleIconAlt,
	showDonationForm = true,
}: Props) => {
	return (
		<section className="hero-video hero-video-block flex flex-col gap-6">
			<div className="relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl bg-black md:min-h-160 md:rounded-b-[56px]">
				{heroImageFilename ? (
					<NextImage
						src={heroImageFilename}
						alt={heroImageAlt ?? title}
						fill
						sizes="100vw"
						className="object-cover"
						priority
					/>
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />

				<div className="max-w-content 2xl:w-site-width absolute inset-0 z-20 ml-[2vw] flex flex-row items-end justify-between gap-4 pr-24 pb-24 pl-8 text-white 2xl:mx-auto 2xl:pr-0">
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
						<div className="flex flex-wrap gap-2">
							{stats.map((stat) => (
								<span
									key={stat.label}
									className="inline-flex items-center justify-center rounded-full border border-white/50 bg-black/40 px-3 py-1 text-xs leading-none font-medium text-white"
								>
									{stat.value} {stat.label}
								</span>
							))}
						</div>
					</div>
					{ showDonationForm ? <div className="hidden shrink-0 lg:block">
						<MakeDonationForm lang={lang} />
					</div> : null}
				</div>
			</div>

			<div className="flex justify-center lg:hidden">
				<MakeDonationForm lang={lang} />
			</div>
		</section>
	);
};
