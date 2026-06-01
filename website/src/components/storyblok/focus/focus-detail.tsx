import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusTitle } from './focus.utils';

type Props = {
	focus: FocusStory;
};

export const FocusDetail = ({ focus }: Props) => {
	const slug = getFocusSlug(focus);
	const title = getFocusTitle(focus.content);

	return (
		<div>
			<p>slug: {slug}</p>
			<p>title: {title}</p>
		</div>
	);
};
