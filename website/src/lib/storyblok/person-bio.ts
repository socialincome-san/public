export type BioSegment = {
	text: string;
	// Set on linked text
	href?: string;
};

const SENTENCE_END = /[.!?…]+["'”’)\]]*(?=\s)/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getLinkHref = (marks: unknown) => {
	const markList: unknown[] = Array.isArray(marks) ? marks : [];
	const link = markList.find((mark) => isRecord(mark) && mark.type === 'link');
	const href: unknown = isRecord(link) && isRecord(link.attrs) ? link.attrs.href : undefined;

	return typeof href === 'string' && href.trim() ? href.trim() : undefined;
};

// Text and links are all a bio keeps: anything else an editor pasted in is read as its plain text
const toSegments = (node: unknown): BioSegment[] => {
	if (!isRecord(node)) {
		return [];
	}
	if (node.type === 'text' && typeof node.text === 'string') {
		return [{ text: node.text, href: getLinkHref(node.marks) }];
	}
	if (node.type === 'hard_break') {
		return [{ text: ' ' }];
	}
	const children = Array.isArray(node.content) ? node.content.flatMap(toSegments) : [];

	// Blocks such as paragraphs run on as one text
	return node.type === 'doc' || children.length === 0 ? children : [...children, { text: ' ' }];
};

const normalize = (segments: BioSegment[]): BioSegment[] => {
	const merged = segments
		.map(({ text, href }) => ({ text: text.replaceAll(/\s+/g, ' '), href }))
		.reduce<BioSegment[]>((result, segment) => {
			const last = result.at(-1);
			if (last && last.href === segment.href) {
				return [...result.slice(0, -1), { ...last, text: `${last.text}${segment.text}`.replaceAll(/ {2,}/g, ' ') }];
			}

			return [...result, segment];
		}, []);
	const first = merged.at(0);
	const last = merged.at(-1);
	if (!first || !last) {
		return [];
	}
	const trimmed =
		merged.length === 1
			? [{ ...first, text: first.text.trim() }]
			: [{ ...first, text: first.text.trimStart() }, ...merged.slice(1, -1), { ...last, text: last.text.trimEnd() }];

	return trimmed.filter((segment) => segment.text !== '');
};

/**
 * The biography of a person as text and links. The field is rich text limited to links; stories saved before that
 * still hold the plain string.
 */
export const getBioSegments = (bio: unknown): BioSegment[] =>
	normalize(typeof bio === 'string' ? [{ text: bio }] : toSegments(bio));

/** Splits a bio after its first sentence. A bio of one sentence is all lead. */
export const splitFirstSentence = (segments: BioSegment[]): { lead: BioSegment[]; rest: BioSegment[] } => {
	const text = segments.map((segment) => segment.text).join('');
	const match = SENTENCE_END.exec(text);
	if (!match) {
		return { lead: segments, rest: [] };
	}
	const end = match.index + match[0].length;
	const lead: BioSegment[] = [];
	const rest: BioSegment[] = [];
	let offset = 0;
	for (const segment of segments) {
		const cut = Math.min(Math.max(end - offset, 0), segment.text.length);
		if (cut > 0) {
			lead.push({ ...segment, text: segment.text.slice(0, cut) });
		}
		if (cut < segment.text.length) {
			rest.push({ ...segment, text: segment.text.slice(cut) });
		}
		offset += segment.text.length;
	}

	return { lead, rest: normalize(rest) };
};
