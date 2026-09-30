export const STYLE_TEMPLATE =
	'Hand-painted watercolor editorial illustration with fine, thin pencil outlines and simplified natural shapes, with occasional gouache-like opaque areas. Soft translucent washes with subtle pigment variation and loose dry-brush edges, without heavy paper grain. Faces are reduced to a few expressive strokes but remain individual and warm; hands are simplified but readable. Use a restrained, slightly desaturated palette of natural skin tones, warm creamy neutrals, with muted mustard-ochre and medium cobalt blue as recurring accent colors. Soft light, no dramatic shadows. Present the subject as an isolated vignette on a plain off-white background, with only essential contextual elements dissolving into loose, uneven watercolor edges and generous negative space. Subject: ';

export function buildPrompt(prompt: string): string {
	return STYLE_TEMPLATE + prompt;
}
