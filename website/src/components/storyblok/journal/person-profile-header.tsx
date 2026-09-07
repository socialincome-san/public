import { SectionHeading } from '@/components/section-heading';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { getPersonGitHubUrl, getPersonLinkedInUrl, getRoleLabel } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const socialLinkClassName =
	'text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline';

type Props = {
	person: ISbStoryData<Person>;
	name: string;
	portraitSrc: string | null;
	roleLabels?: Record<string, string>;
};

export const PersonProfileHeader = ({ person, name, portraitSrc, roleLabels }: Props) => {
	const { avatar, bio, githubName, linkedinName, primaryRole } = person.content;
	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const bioText = bio?.trim();

	return (
		<header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
			{portraitSrc && (
				<div className="bg-muted relative mx-auto aspect-4/5 w-44 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-48">
					<Image
						src={portraitSrc}
						alt={avatar?.alt ?? name}
						fill
						sizes="(min-width: 640px) 192px, 176px"
						className="object-cover object-top"
						priority
					/>
				</div>
			)}

			<div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
				<div className="space-y-2">
					<SectionHeading as="h1" size={1} align="left" bold className="text-foreground mb-0 leading-tight md:mb-0">
						{name}
					</SectionHeading>
					{roleLabel && <p className="text-muted-foreground text-base sm:text-lg">{roleLabel}</p>}
				</div>
				{bioText && <p className="text-foreground max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">{bioText}</p>}
				{(linkedinName ?? githubName) && (
					<div className="flex flex-wrap justify-center gap-4 sm:justify-start">
						{linkedinName && (
							<Link
								href={getPersonLinkedInUrl(linkedinName)}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClassName}
							>
								LinkedIn
								<ExternalLinkIcon className="size-3.5" aria-hidden="true" />
							</Link>
						)}
						{githubName && (
							<Link
								href={getPersonGitHubUrl(githubName)}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClassName}
							>
								GitHub
								<ExternalLinkIcon className="size-3.5" aria-hidden="true" />
							</Link>
						)}
					</div>
				)}
			</div>
		</header>
	);
};
