import { cn } from '../../../cn';

type EmbedProps = {
	src: string;
	// Accessible name of the frame, e.g. "Event calendar".
	title: string;
	// Height in pixels. Without it, the frame keeps a 16:9 ratio.
	height?: number;
	caption?: string;
	// Static HTML such as an archived email: no scripts, forms or access to this site; links still open in new tabs.
	staticContent?: boolean;
};

// Third-party content runs sandboxed: it may run its own scripts and open links in new tabs, but cannot navigate this page.
const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
const STATIC_CONTENT_SANDBOX = 'allow-popups allow-popups-to-escape-sandbox';

export const Embed = ({ src, title, height, caption, staticContent = false }: EmbedProps) => (
	<figure className="w-full">
		<iframe
			src={src}
			title={title}
			height={height}
			sandbox={staticContent ? STATIC_CONTENT_SANDBOX : SANDBOX}
			allow="fullscreen"
			loading="lazy"
			referrerPolicy="strict-origin-when-cross-origin"
			className={cn('w-full rounded-xl border-0', !height && 'aspect-video')}
		/>
		{caption ? <figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption> : null}
	</figure>
);
