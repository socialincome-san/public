import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import NextImage from 'next/image';

const PERSON_CARD_IMAGE_WIDTH = 400;
const PERSON_CARD_IMAGE_HEIGHT = 500;

type Props = {
	person: ISbStoryData<Person>;
};

export const PersonCard = ({ person }: Props) => {
	const { avatar, firstName, fullName, lastName, primaryRole } = person.content;
	const imageSource = avatar?.filename
		? formatStoryblokUrl(avatar.filename, PERSON_CARD_IMAGE_WIDTH, PERSON_CARD_IMAGE_HEIGHT, avatar.focus)
		: null;
	const role = typeof primaryRole === 'string' ? primaryRole.trim() : '';

	return (
		<div className="w-full max-w-[305px] overflow-hidden rounded-xl bg-white p-3 shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]">
			<div className="relative aspect-[280/350] w-full overflow-hidden rounded-lg bg-muted">
				{imageSource ? (
					<NextImage
						src={imageSource}
						alt={avatar.alt ?? fullName}
						fill
						sizes="(min-width: 1280px) 281px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
						className="object-cover"
					/>
				) : null}
				<svg
					className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 w-full"
					viewBox="0 0 279 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
				>
					<path
						d="M0 0H132.305C159.296 0 185.482 9.1858 206.558 26.0465C211.375 29.9004 217.361 32 223.53 32H279H0V0Z"
						fill="white"
					/>
				</svg>
			</div>
			<div className="relative z-20 -mt-6 flex items-end justify-between gap-4 rounded-b-lg px-2 pt-3 pb-3">
				<h3 className="relative text-2xl leading-8 font-bold">
					{firstName || fullName}
					{lastName ? (
						<>
							<br />
							<span className="font-normal">{lastName}</span>
						</>
					) : null}
				</h3>
				{role ? <p className="capitalize relative shrink-0 pb-1 text-sm leading-none">{role}</p> : null}
			</div>
		</div>
	);
};
