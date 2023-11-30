import { WebsiteLanguage } from '@/i18n';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { SiFacebook, SiGithub, SiInstagram, SiLinkedin, SiTwitter } from '@icons-pack/react-simple-icons';
import { IconType } from '@icons-pack/react-simple-icons/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Card, CardContent, CardHeader, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Link from 'next/link';

export function SocialMediaButton({ Icon, title, href }: { Icon: IconType; href: string; title: string }) {
	return (
		<Link href={href} target="_blank" className="flex flex-col">
			<Button Icon={Icon} variant="ghost" size="lg">
				{title}
			</Button>
		</Link>
	);
}

export async function Contact({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-about-us'],
	});

	return (
		<BaseContainer id="contact" backgroundColor="bg-muted" className="flex flex-col justify-center py-16 md:py-32">
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('contact.header')}
			</Typography>
			<p className="mb-8 lg:mb-16">
				{translator.t<{ text: string; color?: FontColor }[]>('contact.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div className="flex flex-col space-y-8">
					<Typography size="lg">{translator.t('contact.paragraph')}</Typography>
					<div>
						<Typography size="2xl" weight="medium" className="mb-4">
							{translator.t('contact.legal-status')}
						</Typography>
						{translator.t<string[]>('contact.legal-status-paragraphs').map((text, index) => (
							<Typography key={index} size="lg" className="py-1">
								{text}
							</Typography>
						))}
					</div>
				</div>
				<Card>
					<CardHeader>
						<Typography size="2xl" weight="medium">
							{translator.t('contact.find-us')}
						</Typography>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 items-center">
							<SocialMediaButton Icon={SiInstagram} title="Instagram" href="https://www.instagram.com/so_income" />
							<SocialMediaButton Icon={SiFacebook} title="Facebook" href="https://www.facebook.com/socialincome.org" />
							<SocialMediaButton Icon={SiTwitter} href="https://twitter.com/so_income" title="Twitter" />
							<SocialMediaButton
								Icon={SiLinkedin}
								title="LinkedIn"
								href="https://www.linkedin.com/company/socialincome"
							/>
							<SocialMediaButton Icon={SiGithub} title="GitHub" href="https://github.com/socialincome-san/public" />
							<SocialMediaButton Icon={EnvelopeIcon} href="mailto:hello@socialincome.org" title="Email" />
						</div>
					</CardContent>
				</Card>
			</div>
		</BaseContainer>
	);
}
