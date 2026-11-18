import { isSafeHref } from '@/lib/utils/string-utils';
import { Prose } from '@socialincome/design-system/data-display/prose/prose';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type Props = {
	children: string;
	size?: 'base' | 'lg';
};

// Contributors write these texts, so only inline formatting, lists and links render. Headings, images and
// the like fall back to their text.
const allowedElements = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'];

const urlTransform = (url: string) => {
	// People often leave out the scheme, e.g. www.example.org.
	const href = /^[a-z][a-z\d+.-]*:/i.test(url) || /^[/#?]/.test(url) ? url : `https://${url}`;

	return isSafeHref(href) && !href.startsWith('/') ? href : '';
};

export const CampaignMarkdown = ({ children, size }: Props) => (
	<Prose size={size}>
		<Markdown
			allowedElements={allowedElements}
			unwrapDisallowed
			skipHtml
			remarkPlugins={[remarkBreaks]}
			urlTransform={urlTransform}
			components={{
				a: ({ href, children: linkChildren }) =>
					href ? (
						<a href={href} target="_blank" rel="nofollow ugc noopener noreferrer">
							{linkChildren}
						</a>
					) : (
						linkChildren
					),
			}}
		>
			{children}
		</Markdown>
	</Prose>
);
