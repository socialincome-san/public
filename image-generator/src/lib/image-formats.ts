// Labels name the platforms each format suits, short enough to fit the select on phones.
// Sizes are multiples of 16 that gpt-image returns exactly.
export const IMAGE_FORMATS = [
	{ value: '1:1', label: 'Instagram, LinkedIn', width: 1024, height: 1024 },
	{ value: '4:5', label: 'Instagram feed', width: 1024, height: 1280 },
	{ value: '9:16', label: 'Stories, Reels', width: 864, height: 1536 },
	{ value: '16:9', label: 'Website, YouTube', width: 1536, height: 864 },
	{ value: '4:3', label: 'Slides', width: 1344, height: 1008 },
	{ value: '3:2', label: 'Newsletter, blog', width: 1536, height: 1024 },
	{ value: '3:4', label: 'Print, flyer', width: 1008, height: 1344 },
] satisfies { value: `${number}:${number}`; label: string; width: number; height: number }[];

export const DEFAULT_IMAGE_FORMAT = IMAGE_FORMATS[0];
