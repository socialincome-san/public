import type { StoryBlokAuthor } from '@socialincome/shared/src/storyblok/article';
import Image from 'next/image';
import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

function StoryBlokAuthorImage(props: { author: ISbStoryData<StoryBlokAuthor> }) {
	return (
		<Image
			src={props.author.content.avatar.filename}
			alt="author"
			className="h-12 w-12 flex-none rounded-full object-cover object-top"
			width={100}
			height={100}
		/>
	);
}

export default StoryBlokAuthorImage;
