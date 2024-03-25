import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SubscriptionInfoForm } from '@/app/[lang]/[region]/(website)/newsletter/subscription-info-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography, BaseContainer } from '@socialincome/ui';
import Image from "next/image";
import aurelieImage from "../about-us/(assets)/aurelie.jpeg";
import Link from "next/link";

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-newsletter'],
	});

	return (
		<>
		<BaseContainer>
		<div className="py-12">
			<div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
				<div className="flex flex-col justify-center gap-3">
					<div>
						<Typography
							weight="medium"
							color="foreground"
							style={{ lineHeight: '70px' }}
							className="mt-2 text-[4rem]"
						>
							{translator.t('updates.title')}
						</Typography>
					</div>
					<div className="my-8">
						<Typography size="2xl" color="muted-foreground">
							{translator.t('updates.description-1')}
						</Typography>
						<div className="mt-4">
							<ul className="list-disc pl-5 mt-2 text-muted-foreground leading-relaxed">
								<li><Typography size="2xl" color="muted-foreground">{translator.t('updates.bullet-1')}</Typography></li>
								<li><Typography size="2xl" color="muted-foreground">{translator.t('updates.bullet-2')}</Typography></li>
								<li><Typography size="2xl" color="muted-foreground">{translator.t('updates.bullet-3')}</Typography></li>
							</ul>
						</div>
						<div className="mt-4">
							<Typography size="2xl" color="muted-foreground">
								{translator.t('updates.description-2')}
							</Typography>
						</div>
						<hr className="my-8 bg-border h-px border-0" />
						<div>
							<div className="mb-4">
									<Typography size="xl" color="muted-foreground">
										{translator.t('updates.description-3')}
									</Typography>
								</div>
								<div>
									<Link
										href="/about-us#team"
										target="_blank"
										rel="noopener noreferrer"
										className="bg-background hover:bg-muted flex items-center rounded-full p-2 text-center text-muted-foreground"
									>
										<Image
											src={aurelieImage}
											width={40}
											height={40}
											className="mr-1 h-10 w-10 rounded-full transition-transform duration-300 object-cover"
											alt="Avatar"
										/>
										<div className="pl-3">
											<span className="text-xl text-muted-foreground">{translator.t('updates.author-name')}</span>
											<span className="text-md pl-2 text-popover-foreground-muted">{translator.t('updates.author-city')}</span>
										</div>
									</Link>
								</div>
							</div>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<div className="card bg-primary w-full rounded-xl p-6">
						<div className="mb-4">
							<Typography size="2xl" color="popover">
								Newsletter Subscription
							</Typography>
						</div>
						<div className="mt-3">
							<SubscriptionInfoForm
								lang={params.lang}
								region={params.region}
								translations={{
									firstname: translator.t("updates.firstname"),
									email: translator.t("updates.email"),
									updatesSubmitButton: translator.t("updates.submit-button"),
									toastMessage: translator.t("updates.newsletter-updated-toast"),
									toastErrorMessage: translator.t("updates.newsletter-error-toast"),
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		</BaseContainer>
		</>
	);
}
