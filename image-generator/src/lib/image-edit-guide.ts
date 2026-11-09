import sharp from 'sharp';
import { getImageCommentPoint, type ImageComment } from './image-comments.ts';

export const createImageEditGuide = async (
	original: Uint8Array,
	comments: ImageComment[],
	size: { width: number; height: number },
) => {
	const points = comments.map((comment) => getImageCommentPoint(comment, size));
	const labels = points.map(({ x, y }, index) => {
		const labelX = x < size.width / 2 ? x + 32 : x - 32;
		const labelY = y < size.height / 2 ? y + 32 : y - 32;
		return `<path d="M ${x} ${y} L ${labelX} ${labelY}" stroke="white" stroke-width="5"/>
			<path d="M ${x} ${y} L ${labelX} ${labelY}" stroke="black" stroke-width="2"/>
			<circle cx="${labelX}" cy="${labelY}" r="16" fill="white" stroke="black" stroke-width="2"/>
			<text x="${labelX}" y="${labelY}" dy="0.35em" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="black">${index + 1}</text>`;
	});
	// Draw centers last so other labels and crosshairs cannot cover the exact marked points.
	const crosshairs = points.map(
		({ x, y }) =>
			`<path d="M ${x - 12} ${y} H ${x + 12} M ${x} ${y - 12} V ${y + 12}" stroke="white" stroke-width="5"/>
		<path d="M ${x - 12} ${y} H ${x + 12} M ${x} ${y - 12} V ${y + 12}" stroke="black" stroke-width="2"/>`,
	);
	const centers = points.map(({ x, y }) => `<circle cx="${x}" cy="${y}" r="3" fill="#ff00ff"/>`);
	return sharp(original)
		.composite([
			{
				input: Buffer.from(
					`<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">${labels.join('')}${crosshairs.join('')}${centers.join('')}</svg>`,
				),
			},
		])
		.png()
		.toBuffer();
};
