import { Prose } from '@socialincome/design-system/data-display/prose/prose';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type Props = {
	children: string;
	size?: 'base' | 'lg';
};

// Contributors write these texts, so only inline formatting, lists and links render. Headings and the
// like fall back to their text, images to their alt text.
const allowedElements = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img'];

const allowedProtocols = new Set(['http:', 'https:', 'mailto:']);

const urlTransform = (url: string) => {
	if (/^[/#?]/.test(url)) {
		return '';
	}
	// People often leave out the scheme, e.g. www.example.org or www.example.org:8443. A port is no scheme.
	const href = /^[a-z][a-z\d+.-]*:(?!\d)/i.test(url) ? url : `https://${url}`;
	try {
		return allowedProtocols.has(new URL(href).protocol) ? href : '';
	} catch {
		return '';
	}
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
				img: ({ alt }) => alt ?? null,
			}}
		>
			{children}
		</Markdown>
	</Prose>
);
