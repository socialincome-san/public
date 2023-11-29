import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Badge, Popover, PopoverContent, PopoverTrigger, Button } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import changeGif from '../(assets)/change.gif';

export default async function LandingPage({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar grid grid-cols-1 content-center items-center gap-16 md:grid-cols-5">
			<div className="mx-auto max-w-lg md:col-span-3 space-y-5">
				{translator.t<{ text: string; color?: FontColor }[]>('landing-page.title').map((title, index) => (
					<Typography as="span" key={index} size="5xl" weight="bold" lineHeight="tight" color={title.color}>
						{title.text}
					</Typography>
				))}
			<Typography size="2xl" lineHeight="normal">
				{translator.t('landing-page.subtitle')}
			</Typography>
				<div className="pt-5 space-x-2 flex">
					<div>
						<Popover>
							<PopoverTrigger>
						<Badge variant="outline" className="hover:bg-muted-foreground text-muted-foreground hover:text-secondary-foreground transition-transform duration-300 hover:scale-105">
							<Typography size="md" weight="normal"  className="p-1">
								{translator.t('landing-page.contact')}
						</Typography>
						</Badge>
							</PopoverTrigger>
							<PopoverContent>
								<div className="space-y-2">
								<Typography size="md" lineHeight="normal" weight="medium">
									{translator.t('landing-page.contact-title')}
								</Typography>
									<a href="mailto:hello@socialincome.org">
										<Button variant="link" className="p-0">
											<Typography size="md" lineHeight="normal" weight="normal">
											{translator.t('landing-page.contact-email')}
										</Typography>
										</Button>
									</a>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<div>
						<Popover>
							<PopoverTrigger>
								<Badge variant="outline" className="hover:bg-muted-foreground text-muted-foreground hover:text-secondary-foreground transition-transform duration-300 hover:scale-105">
									<Typography size="md" weight="normal"  className="p-1">
										{translator.t('landing-page.registration')}
									</Typography>
								</Badge>
							</PopoverTrigger>
							<PopoverContent>
								<div className="space-y-2">
									<Typography size="md" lineHeight="normal" weight="medium">
										{translator.t('landing-page.registration-title')}
									</Typography>
									<Typography size="md" lineHeight="normal">
										{translator.t('landing-page.registration-foundation')}
									</Typography>
									<div className="flex space-x-1 items-center">
										<Typography size="md" lineHeight="normal">
											{translator.t('landing-page.registration-uid')}
										</Typography>
										<a href="https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695&lang=en">
											<Button variant="link" className="p-0 m-0">
												<Typography size="md" lineHeight="normal" weight="normal">
													{translator.t('landing-page.registration-uid-nr')}
												</Typography>
											</Button>
										</a>
									</div>
									<div className="flex space-x-1 items-center">
										<Typography size="md" lineHeight="normal">
											{translator.t('landing-page.registration-duns')}
										</Typography>
										<a href="https://www.dnb.com/duns/what-is-a-DUNS-number.html">
											<Button variant="link" className="p-0">
												<Typography size="md" lineHeight="normal" weight="normal">
													{translator.t('landing-page.registration-duns-nr')}
												</Typography>
											</Button>
										</a>
								</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>
			<Image
				className="mx-auto w-full max-w-lg md:order-first md:col-span-2"
				src={changeGif}
				alt="Change animation"
				style={{ objectFit: 'cover' }}
			/>
		</BaseContainer>
	);
}
