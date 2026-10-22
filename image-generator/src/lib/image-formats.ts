export const IMAGE_FORMATS = [
	{ value: '1:1', label: 'Square', width: 1024, height: 1024 },
	{ value: '16:9', label: 'Widescreen', width: 1536, height: 864 },
	{ value: '9:16', label: 'Portrait', width: 864, height: 1536 },
	{ value: '4:3', label: 'Landscape', width: 1344, height: 1008 },
	{ value: '3:4', label: 'Portrait', width: 1008, height: 1344 },
	{ value: '3:2', label: 'Photography', width: 1536, height: 1024 },
] satisfies { value: `${number}:${number}`; label: string; width: number; height: number }[];

export const DEFAULT_IMAGE_FORMAT = IMAGE_FORMATS[0];
