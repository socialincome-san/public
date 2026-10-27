// Imports nothing, so `node --test` can run its tests without a bundler.

const STYLE_TEMPLATE =
	'The attached Social Income illustrations are style references only. Create one new illustration in exactly their visual style: the same hand-painted watercolor and gouache technique, brushwork and paper texture, the same soft, muted palette of cream, sand and warm browns with mustard yellow and cobalt blue accents, the same simplified faces and amount of detail, and the same composition logic: an isolated scene on a plain white background with lots of empty white space and at most a small, loose patch of setting. Do not copy any person, object or composition from the references: invent new clothing, faces and poses, and never reuse a garment pattern from the references. Keep clothing mostly plain in cream, white, sand and soft muted tones; any phone is always mustard yellow, and besides the phone at least one more item is clearly mustard yellow, such as a bag, a scarf, a headwrap, a cup or a basket. Use mustard yellow and a dusty, muted cobalt blue as clear, visible accents on two to four items per scene, as in the references, for example the phone, a bag, a headwrap, a scarf, a bench or a cart; large surfaces such as whole buildings, walls or shop fronts stay neutral, and the colors are never neon or saturated. No other strong colors. Draw with noticeably less detail than the references, never more: a few large, simple painted shapes, buildings, shelters, shops and vehicles reduced to flat blocks of color with almost no inner detail, no small items such as individual bottles, packages, rails or wires, no landmarks or skyline in the background, and faces with only a few marks. Keep the figures small in the frame with generous white space around them, and keep faces as simplified as in the references. Nothing written anywhere in the image.';

const USER_REFERENCE_NOTE =
	'The first attached image is the user’s own reference: use it for the subject and composition, not for the style.';

// Saved prompts end with one of these markers followed by what the user typed, so the gallery can show only that part.
// Older prompts used the same subject marker.
const SUBJECT_MARKER = 'Subject: ';
const CHANGES_MARKER = 'Changes:\n';

type EditComment = { x: number; y: number; text: string };

export const buildGeneratePrompt = ({
	subject,
	setting,
	hasUserReference,
}: {
	subject: string;
	setting: string;
	hasUserReference: boolean;
}) => [hasUserReference && USER_REFERENCE_NOTE, STYLE_TEMPLATE, setting, SUBJECT_MARKER + subject].filter(Boolean).join(' ');

const toPercent = (fraction: number) => `${Math.round(fraction * 100)}%`;

export const buildEditPrompt = (comments: EditComment[]) =>
	[
		'Edit the attached illustration. Apply every numbered change below and keep everything else exactly as it is: composition, people, colors, white background and the hand-painted watercolor style.',
		'Each change names a point as a percentage of the image width from the left and of the image height from the top. The point marks the object or area to change, not its exact extent.',
		'Do not draw markers, numbers or text.',
		CHANGES_MARKER +
			comments
				.map(
					({ x, y, text }, index) => `${index + 1}. At ${toPercent(x)} from the left, ${toPercent(y)} from the top: ${text}`,
				)
				.join('\n'),
	].join('\n');

// The first marker wins, so a user who types "Subject: " into a change request does not confuse it.
export const extractUserInput = (prompt: string) => {
	const [match] = [SUBJECT_MARKER, CHANGES_MARKER]
		.map((marker) => ({ marker, start: prompt.indexOf(marker) }))
		.filter(({ start }) => start !== -1)
		.sort((a, b) => a.start - b.start);

	return (match ? prompt.slice(match.start + match.marker.length) : prompt).trim();
};
