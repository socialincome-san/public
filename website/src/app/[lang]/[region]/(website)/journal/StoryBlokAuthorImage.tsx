import type { StoryBlokAuthor } from '@socialincome/shared/src/storyblok/article';
import Image from 'next/image';

function StoryBlokAuthorImage(props: { author: StoryBlokAuthor }) {
	return <Image
		src={props.author.content.avatar.filename}
		alt="author"
		className="w-12 h-12 flex-none rounded-full object-cover object-top"
		width={100}
		height={100}
	/>;
}

export default StoryBlokAuthorImage;