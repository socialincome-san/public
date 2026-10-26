import { cn } from '../../../cn';

type EmbedProps = {
	src: string;
	// Accessible name of the frame, e.g. "Event calendar".
	title: string;
	// Height in pixels. Without it, the frame keeps a 16:9 ratio.
	height?: number;
	caption?: string;
};

// Third-party content runs sandboxed: it may run its own scripts and open links in new tabs, but cannot navigate this page.
const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';

export const Embed = ({ src, title, height, caption }: EmbedProps) => (
	<figure className="w-full">
		<iframe
			src={src}
			title={title}
			height={height}
			sandbox={SANDBOX}
			allow="fullscreen"
			loading="lazy"
			referrerPolicy="strict-origin-when-cross-origin"
			className={cn('w-full rounded-xl border-0', !height && 'aspect-video')}
		/>
		{caption ? <figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption> : null}
	</figure>
);
