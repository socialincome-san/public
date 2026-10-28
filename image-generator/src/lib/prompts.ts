import { getImageCommentPoint, type ImageComment } from './image-comments.ts';

const STYLE_TEMPLATE =
	'The attached Social Income illustrations are style references only. Create one new illustration in exactly their visual style: the same hand-painted watercolor and gouache technique, brushwork and paper texture, the same soft, muted palette of cream, sand and warm browns with mustard yellow and cobalt blue accents, the same simplified faces and amount of detail, and the same composition logic: an isolated scene on a plain white background with lots of empty white space and at most a small, loose patch of setting. Do not copy any person, object or composition from the references: invent new clothing, faces and poses, and never reuse a garment pattern from the references. Keep clothing mostly plain in cream, white, sand and soft muted tones; any phone is always mustard yellow, and besides the phone at least one more item is clearly mustard yellow, such as a bag, a scarf, a headwrap, a cup or a basket. Use mustard yellow and a dusty, muted cobalt blue as clear, visible accents on two to four items per scene, as in the references, for example the phone, a bag, a headwrap, a scarf, a bench or a cart; large surfaces such as whole buildings, walls or shop fronts stay neutral, and the colors are never neon or saturated. No other strong colors. Draw with noticeably less detail than the references, never more: a few large, simple painted shapes, buildings, shelters, shops and vehicles reduced to flat blocks of color with almost no inner detail, no small items such as individual bottles, packages, rails or wires, no landmarks or skyline in the background, and faces with only a few marks. Keep the figures small in the frame with generous white space around them, and keep faces as simplified as in the references. Nothing written anywhere in the image.';

const USER_REFERENCE_NOTE =
	'The first attached image is the user’s own reference: use it for the subject and composition, not for the style.';

// Saved prompts end with one of these markers followed by what the user typed, so the gallery can show only that part.
// Older prompts used the same subject marker.
const SUBJECT_MARKER = 'Subject:';
const CHANGES_MARKER = 'Changes:\n';

export const buildGeneratePrompt = ({
	subject,
	setting,
	hasUserReference,
}: {
	subject: string;
	setting: string;
	hasUserReference: boolean;
}) =>
	[hasUserReference && USER_REFERENCE_NOTE, STYLE_TEMPLATE, setting, `${SUBJECT_MARKER} ${subject}`]
		.filter(Boolean)
		.join(' ');

const toPercent = (fraction: number) => `${Number((fraction * 100).toFixed(4))}%`;

export const buildEditPrompt = (comments: ImageComment[], size: { width: number; height: number }) => {
	const locations = comments.map((comment, index) => {
		const { x, y } = getImageCommentPoint(comment, size);
		return `${index + 1}: x=${Number(x.toFixed(4))}, y=${Number(y.toFixed(4))}`;
	});

	return [
		`Edit the first attached image, the clean original (${size.width} pixels wide and ${size.height} pixels high). The second image is a location guide only. Its numbered labels connect to crosshairs; the magenta center of each crosshair is the exact marked point. Match the label numbers to the changes below. Target the object or area at the crosshair, not the offset label or a similar object nearby.`,
		'Apply only the requested changes. Use the smallest area needed for each change; keep surrounding objects and all unrelated areas exactly as they are, including composition, people, colors, white background and the hand-painted watercolor style. Do not move the target, add extra objects or reinterpret the scene.',
		'Each change names a point as a percentage of the image width from the left and of the image height from the top. The point marks the object or area to change, not its exact extent.',
		`Pixel locations use a top-left origin, x rightward and y downward: ${locations.join('; ')}`,
		'Do not copy the location guide or draw markers, crosshairs, numbers or text in the result.',
		CHANGES_MARKER +
			comments
				.map(
					({ x, y, text }, index) => `${index + 1}. At ${toPercent(x)} from the left, ${toPercent(y)} from the top: ${text}`,
				)
				.join('\n'),
	].join('\n');
};

// The first marker wins, so a user who types "Subject: " into a change request does not confuse it.
export const extractUserInput = (prompt: string) => {
	if (prompt.startsWith('Edit the supplied original image according to all of the following comments.')) {
		const marker = ' Comments: ';
		const start = prompt.indexOf(marker);
		if (start === -1) return '';
		try {
			const comments: unknown = JSON.parse(prompt.slice(start + marker.length));
			if (!Array.isArray(comments)) return '';
			return comments
				.flatMap((comment: unknown) =>
					typeof comment === 'object' && comment !== null && 'text' in comment && typeof comment.text === 'string'
						? [comment.text.trim()]
						: [],
				)
				.filter(Boolean)
				.join('\n');
		} catch {
			return '';
		}
	}
	const [match] = [SUBJECT_MARKER, CHANGES_MARKER]
		.map((marker) => ({ marker, start: prompt.indexOf(marker) }))
		.filter(({ start }) => start !== -1)
		.sort((a, b) => a.start - b.start);

	const input = (match ? prompt.slice(match.start + match.marker.length) : prompt).trim();
	return match?.marker === CHANGES_MARKER
		? input.replace(/^\d+\. At \d+(?:\.\d+)?% from the left, \d+(?:\.\d+)?% from the top: /gm, '')
		: input;
};
