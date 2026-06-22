import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';

import type { Person, TeamGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';

const PERSON_IMAGE_SIZE = 300;

type Props = {
	blok: TeamGrid;
	lang: WebsiteLanguage;
};

export const TeamGridBlock = async ({ blok, lang }: Props) => {
	const uuids = blok.person.map((person) => (typeof person === 'string' ? person : person.uuid));
	const personsResult = await services.storyblok.getPersonsByUuids(lang, uuids);
	const persons = personsResult.success ? personsResult.data : [];

	if (persons.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.title && <h2 className="text-3xl font-bold">{blok.title}</h2>}
			{blok.description && (
				<div className="mt-4 text-lg text-black">
					<RichTextRenderer richTextDocument={blok.description} />
				</div>
			)}

			<ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{persons.map((person) => (
					<PersonCard key={person.uuid} person={person} />
				))}
			</ul>
		</BlockWrapper>
	);
};

const PersonCard = ({ person }: { person: ISbStoryData<Person> }) => {
	const { avatar, fullName } = person.content;

	return (
		<li className="flex flex-col">
			{avatar?.filename && (
				<NextImage
					src={formatStoryblokUrl(avatar.filename, PERSON_IMAGE_SIZE, PERSON_IMAGE_SIZE, avatar.focus)}
					alt={avatar.alt ?? ''}
					className="aspect-square w-full rounded-2xl object-cover object-top"
					width={PERSON_IMAGE_SIZE}
					height={PERSON_IMAGE_SIZE}
				/>
			)}
			<h3 className="mt-4 text-base leading-tight font-medium">{fullName}</h3>
		</li>
	);
};
