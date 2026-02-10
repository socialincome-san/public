import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Badge, BaseContainer, linkCn, Popover, PopoverContent, PopoverTrigger, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import Link from 'next/link';
import changeGif from '../(assets)/change.gif';

export default async function LandingPage({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer className="grid grid-cols-1 content-center items-center gap-16 md:grid-cols-5">
			<div className="mx-auto max-w-lg space-y-5 md:col-span-3">
				{translator.t<{ text: string; color?: FontColor }[]>('landing-page.title').map((title, index) => (
					<Typography as="span" key={index} size="5xl" weight="bold" lineHeight="tight" color={title.color}>
						{title.text}
					</Typography>
				))}
				<Typography size="2xl" lineHeight="normal">
					{translator.t('landing-page.subtitle')}
				</Typography>
				<div className="flex space-x-2 pt-5">
					<div>
						<Popover>
							<PopoverTrigger>
								<Badge variant="interactive-muted">
									<Typography size="md" weight="normal" className="p-1">
										{translator.t('landing-page.contact')}
									</Typography>
								</Badge>
							</PopoverTrigger>
							<PopoverContent>
								<div className="space-y-2">
									<Typography size="md" lineHeight="normal" weight="medium">
										{translator.t('landing-page.contact-title')}
									</Typography>
									<Link className={linkCn()} href="mailto:hello@socialincome.org">
										{translator.t('landing-page.contact-email')}
									</Link>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<div>
						<Popover>
							<PopoverTrigger>
								<Badge variant="interactive-muted">
									<Typography size="md" weight="normal" className="p-1">
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
									<div className="flex items-center space-x-1">
										<Typography size="md" lineHeight="normal">
											{translator.t('landing-page.registration-uid')}
										</Typography>
										<Link
											className={linkCn({ arrow: 'external', underline: 'none' })}
											href="https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695&lang=en"
											target="_blank"
											rel="noopener noreferrer"
										>
											{translator.t('landing-page.registration-uid-nr')}
										</Link>
									</div>
									<div className="flex items-center space-x-1">
										<Typography size="md" lineHeight="normal">
											{translator.t('landing-page.registration-duns')}
										</Typography>
										<Link
											className={linkCn({ arrow: 'external', underline: 'none' })}
											href="https://www.dnb.com/duns/what-is-a-DUNS-number.html"
											target="_blank"
											rel="noopener noreferrer"
										>
											{translator.t('landing-page.registration-duns-nr')}
										</Link>
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
