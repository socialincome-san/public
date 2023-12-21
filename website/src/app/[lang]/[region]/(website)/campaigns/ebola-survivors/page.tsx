import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SiFigma, SiGithub } from '@icons-pack/react-simple-icons';
import { IconType } from '@icons-pack/react-simple-icons/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';
import anthonyImage from './ismatu-gwendolyn.jpeg';

function SocialMediaButton({ Icon, title, href }: { Icon: IconType; href: string; title: string }) {
	return (
		<Link href={href} target="_blank" className="flex flex-col">
			<Button Icon={Icon} variant="ghost" size="lg">
				{title}
			</Button>
		</Link>
	);
}

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar flex flex-col items-center space-y-12 py-16 md:py-32">
			<Link
				href="https://github.com/anthonyray"
				target="_blank"
				rel="noopener noreferrer"
				className="bg-card hover:bg-muted border-accent flex items-center rounded-full border-2 p-2 text-center"
			>
				<Image
					src={anthonyImage}
					width={40}
					height={40}
					className="mr-2 h-10 w-10 rounded-full transition-transform duration-300"
					alt="Avatar"
				/>
				<span className="pl-3 pr-6 text-lg text-black/75">anthonyray {translator.t('issue-assigned')}</span>
			</Link>
			<div className="flex flex-col space-y-12">
				<Typography as="h1" size="5xl" weight="bold" className="text mx-auto text-center">
					{translator.t('title')}
				</Typography>
				<Typography as="h2" size="lg" lineHeight="snug" className="text mx-auto max-w-3xl text-center">
					{translator.t('subtitle')}
				</Typography>
				<div className="flex justify-center space-x-4">
					<SocialMediaButton
						Icon={SiGithub}
						href="https://github.com/socialincome-san/public/issues/550"
						title="GitHub Issue"
					/>
					<SocialMediaButton
						Icon={SiFigma}
						href="https://www.figma.com/proto/qGO3YI21AWIjWEyMPGUczM/Website-Social?type=design&node-id=376-2473&viewport=2567%2C-513%2C0.45&t=jG5pilvATJ4817xv-0&scaling=contain&starting-point-node-id=143%3A29044"
						title="Figma Design"
					/>
				</div>
			</div>
		</BaseContainer>
	);
}
