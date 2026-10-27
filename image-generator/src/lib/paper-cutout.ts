import 'server-only';

import sharp from 'sharp';

// Removes the white paper behind a generated watercolor illustration and returns a transparent PNG.
// Tuned on the generator's output: a near-white paper background, soft painted edges, pale hair
// highlights and white clothing that must stay opaque.

const FILL = 14; // smoothed distance from paper that the background flood fill may cross
const ENCLOSED_MAX_MEAN = 2.5; // enclosed gaps this close to paper are background, painted white is not
const ENCLOSED_MIN_AREA = 12;
const BARE = 8; // raw distance below which a pixel is bare paper
const SLIVER_MAX_AREA = 400;
const SLIVER_MAX_MEAN = 3;
const SLIVER_REACH = 10; // px from the outline in which bare-paper slivers are removed
const EDGE = 4; // px of soft edge along every outline
const WIDE = 10; // px of soft edge for thin pale strokes such as white rim highlights in hair
const THIN_MAX_AREA = 1500; // pale areas larger than this (a white shirt) keep a solid edge
const LO = 6; // soft-edge pixels this close to paper are fully transparent
const HI = 40; // soft-edge pixels this far from paper are fully opaque

const neighbors = (i: number, width: number, height: number) => {
	const x = i % width;
	const y = (i - x) / width;
	return [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, y > 0 ? i - width : -1, y < height - 1 ? i + width : -1];
};

// Collects the 4-connected region around start whose pixels pass include, marking them in seen.
const collectRegion = (start: number, width: number, height: number, seen: Uint8Array, include: (i: number) => boolean) => {
	const region = [start];
	seen[start] = 1;
	for (let k = 0; k < region.length; k++)
		for (const j of neighbors(region[k], width, height))
			if (j >= 0 && !seen[j] && include(j)) {
				seen[j] = 1;
				region.push(j);
			}
	return region;
};

// Chessboard distance in px from each pixel to the background, capped at max + 1.
const distanceToBackground = (background: Uint8Array, width: number, height: number, max: number) => {
	const distance = new Uint8Array(background.length).fill(max + 1);
	let frontier: number[] = [];
	for (let i = 0; i < background.length; i++)
		if (background[i]) {
			distance[i] = 0;
			frontier.push(i);
		}
	for (let step = 1; step <= max; step++) {
		const next: number[] = [];
		for (const i of frontier) {
			const x = i % width;
			const y = (i - x) / width;
			for (let dy = -1; dy <= 1; dy++)
				for (let dx = -1; dx <= 1; dx++) {
					const xx = x + dx;
					const yy = y + dy;
					if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
					const j = yy * width + xx;
					if (distance[j] === max + 1) {
						distance[j] = step;
						next.push(j);
					}
				}
		}
		frontier = next;
	}
	return distance;
};

export const removePaperBackground = async (input: Buffer): Promise<Buffer> => {
	const { data, info } = await sharp(input).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width, height } = info;
	const count = width * height;

	// Paper color: median of each channel along the two outermost rows and columns.
	const borderValues: number[][] = [[], [], []];
	const addBorderPixel = (i: number) => {
		for (let c = 0; c < 3; c++) borderValues[c].push(data[i * 3 + c]);
	};
	for (let x = 0; x < width; x++) for (const y of [0, 1, height - 2, height - 1]) addBorderPixel(y * width + x);
	for (let y = 0; y < height; y++) for (const x of [0, 1, width - 2, width - 1]) addBorderPixel(y * width + x);
	const paper = borderValues.map((values) => values.sort((a, b) => a - b)[values.length >> 1]);

	// Distance from paper per pixel: the largest channel difference.
	const dist = new Float32Array(count);
	for (let i = 0; i < count; i++)
		dist[i] = Math.max(
			Math.abs(paper[0] - data[i * 3]),
			Math.abs(paper[1] - data[i * 3 + 1]),
			Math.abs(paper[2] - data[i * 3 + 2]),
		);

	// 5×5 average so the paper texture does not stop the flood fill.
	const smooth = new Float32Array(count);
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			let sum = 0;
			let n = 0;
			for (let yy = Math.max(0, y - 2); yy <= Math.min(height - 1, y + 2); yy++)
				for (let xx = Math.max(0, x - 2); xx <= Math.min(width - 1, x + 2); xx++) {
					sum += dist[yy * width + xx];
					n++;
				}
			smooth[y * width + x] = sum / n;
		}

	// Paper regions become background when they touch the border, or when they are enclosed (between
	// legs, under a bench) but as untouched as the paper itself. Painted white has visible brushwork.
	const background = new Uint8Array(count);
	const paperSeen = new Uint8Array(count);
	for (let start = 0; start < count; start++) {
		if (paperSeen[start] || smooth[start] >= FILL) continue;
		const region = collectRegion(start, width, height, paperSeen, (j) => smooth[j] < FILL);
		const touchesBorder = region.some((i) => {
			const x = i % width;
			const y = (i - x) / width;
			return x === 0 || y === 0 || x === width - 1 || y === height - 1;
		});
		const mean = region.reduce((sum, i) => sum + dist[i], 0) / region.length;
		if (touchesBorder || (region.length >= ENCLOSED_MIN_AREA && mean < ENCLOSED_MAX_MEAN))
			for (const i of region) background[i] = 1;
	}

	// Thin slivers between hair strands are blurred away by the smoothing, so a second pass on raw
	// pixels grows the background into adjacent bare paper and removes small bare islands near the
	// outline. Bare highlights deeper inside a white shirt stay painted.
	const grow: number[] = [];
	for (let i = 0; i < count; i++) if (background[i]) grow.push(i);
	for (let i = grow.pop(); i !== undefined; i = grow.pop())
		for (const j of neighbors(i, width, height))
			if (j >= 0 && !background[j] && dist[j] < BARE) {
				background[j] = 1;
				grow.push(j);
			}
	const reach = distanceToBackground(background, width, height, SLIVER_REACH);
	const bareSeen = new Uint8Array(count);
	for (let start = 0; start < count; start++) {
		if (bareSeen[start] || background[start] || dist[start] >= BARE) continue;
		const region = collectRegion(start, width, height, bareSeen, (j) => !background[j] && dist[j] < BARE);
		const mean = region.reduce((sum, i) => sum + dist[i], 0) / region.length;
		const nearOutline = region.some((i) => reach[i] <= SLIVER_REACH);
		if (nearOutline && region.length >= 4 && region.length <= SLIVER_MAX_AREA && mean < SLIVER_MAX_MEAN)
			for (const i of region) background[i] = 1;
	}

	// Soft edge: every outline gets EDGE px, small pale areas (hair highlights) up to WIDE px.
	const near = distanceToBackground(background, width, height, WIDE);
	const thin = new Uint8Array(count);
	const paleSeen = new Uint8Array(count);
	for (let start = 0; start < count; start++) {
		if (paleSeen[start] || background[start] || dist[start] >= HI) continue;
		const region = collectRegion(start, width, height, paleSeen, (j) => !background[j] && dist[j] < HI);
		if (region.length < THIN_MAX_AREA) for (const i of region) thin[i] = 1;
	}
	const soft = new Uint8Array(count);
	for (let i = 0; i < count; i++) soft[i] = !background[i] && (near[i] <= EDGE || (near[i] <= WIDE && thin[i])) ? 1 : 0;

	// Soft pixels take the color of the painted pixels just inside them, working outward, so pale
	// edge pixels never keep the paper white that would flash on dark backgrounds.
	const color = Float32Array.from(data);
	for (let pass = WIDE; pass >= 1; pass--)
		for (let y = 0; y < height; y++)
			for (let x = 0; x < width; x++) {
				const i = y * width + x;
				if (!soft[i] || near[i] !== pass) continue;
				const sum = [0, 0, 0];
				let n = 0;
				for (let yy = Math.max(0, y - 1); yy <= Math.min(height - 1, y + 1); yy++)
					for (let xx = Math.max(0, x - 1); xx <= Math.min(width - 1, x + 1); xx++) {
						const j = yy * width + xx;
						if (background[j] || near[j] <= pass) continue;
						for (let c = 0; c < 3; c++) sum[c] += color[j * 3 + c];
						n++;
					}
				if (n) for (let c = 0; c < 3; c++) color[i * 3 + c] = sum[c] / n;
			}

	const output = Buffer.alloc(count * 4);
	for (let i = 0; i < count; i++) {
		let alpha = 1;
		if (background[i]) alpha = 0;
		else if (soft[i]) alpha = Math.min(1, Math.max(0, (dist[i] - LO) / (HI - LO)));
		if (alpha > 0) for (let c = 0; c < 3; c++) output[i * 4 + c] = Math.round(color[i * 3 + c]);
		output[i * 4 + 3] = Math.round(alpha * 255);
	}
	return sharp(output, { raw: { width, height, channels: 4 } })
		.png()
		.toBuffer();
};
