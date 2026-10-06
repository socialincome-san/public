/**
 * The revealed surface behind the page. The panel, its sticky close button, the frame bars and the
 * corner gradients must all paint this same colour — the rounded-corner illusion only works while
 * they match. Written as literal class strings because Tailwind scans for those at build time.
 */
export const PANEL_SURFACE_CLASS = 'bg-backstage';
export const CORNER_TOP_CLASS =
	'bg-[radial-gradient(circle_farthest-side_at_0_100%,transparent_99%,var(--color-backstage))]';
export const CORNER_BOTTOM_CLASS =
	'bg-[radial-gradient(circle_farthest-side_at_0_0,transparent_99%,var(--color-backstage))]';
