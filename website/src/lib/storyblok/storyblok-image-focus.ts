const STORYBLOK_FOCUS_REGEX = /^\d+x\d+:\d+x\d+$/;

export type StoryblokFocusPoint = {
	x: number;
	y: number;
};

type ObjectCoverLayout = {
	scale: number;
	offsetX: number;
	offsetY: number;
};

export const toStoryblokFocus = (x: number, y: number): string => `${x}x${y}:${x + 1}x${y + 1}`;

export const parseStoryblokFocus = (focus: string | null | undefined): StoryblokFocusPoint | null => {
	if (!focus || !STORYBLOK_FOCUS_REGEX.test(focus)) {
		return null;
	}
	const [start, end] = focus.split(':');
	const [startX, startY] = start.split('x').map(Number);
	const [endX, endY] = end.split('x').map(Number);
	if (!Number.isFinite(startX) || !Number.isFinite(startY) || !Number.isFinite(endX) || !Number.isFinite(endY)) {
		return null;
	}
	if (start === end || (endX === startX + 1 && endY === startY + 1)) {
		return { x: startX, y: startY };
	}

	return null;
};

export const normalizeStoryblokFocusForImageService = (focus: string): string => {
	const parsed = parseStoryblokFocus(focus);
	if (!parsed) {
		return focus;
	}
	const [start, end] = focus.split(':');

	return start === end ? toStoryblokFocus(parsed.x, parsed.y) : focus;
};

export const isValidStoryblokFocus = (value: string | null | undefined): value is string =>
	typeof value === 'string' && STORYBLOK_FOCUS_REGEX.test(value);

export const focusToObjectPosition = (
	focus: string | null | undefined,
	naturalWidth: number,
	naturalHeight: number,
): string => {
	const parsed = parseStoryblokFocus(focus);
	if (!parsed || naturalWidth <= 0 || naturalHeight <= 0) {
		return '50% 50%';
	}

	return `${(parsed.x / naturalWidth) * 100}% ${(parsed.y / naturalHeight) * 100}%`;
};

export const clickToStoryblokFocus = (
	clickX: number,
	clickY: number,
	containerWidth: number,
	containerHeight: number,
	naturalWidth: number,
	naturalHeight: number,
	currentFocus?: string | null,
): string => {
	const current = parseStoryblokFocus(currentFocus);
	const objectPositionXPercent = current && naturalWidth > 0 ? (current.x / naturalWidth) * 100 : 50;
	const objectPositionYPercent = current && naturalHeight > 0 ? (current.y / naturalHeight) * 100 : 50;
	const { scale, offsetX, offsetY } = getObjectCoverLayout(
		containerWidth,
		containerHeight,
		naturalWidth,
		naturalHeight,
		objectPositionXPercent,
		objectPositionYPercent,
	);
	const imageX = Math.round((clickX - offsetX) / scale);
	const imageY = Math.round((clickY - offsetY) / scale);

	return toStoryblokFocus(
		Math.max(0, Math.min(Math.max(naturalWidth - 1, 0), imageX)),
		Math.max(0, Math.min(Math.max(naturalHeight - 1, 0), imageY)),
	);
};

export const focusToMarkerPosition = (
	focus: string,
	containerWidth: number,
	containerHeight: number,
	naturalWidth: number,
	naturalHeight: number,
): { x: number; y: number } | null => {
	const parsed = parseStoryblokFocus(focus);
	if (!parsed || containerWidth <= 0 || containerHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
		return null;
	}
	const { scale, offsetX, offsetY } = getObjectCoverLayout(
		containerWidth,
		containerHeight,
		naturalWidth,
		naturalHeight,
		(parsed.x / naturalWidth) * 100,
		(parsed.y / naturalHeight) * 100,
	);

	return { x: parsed.x * scale + offsetX, y: parsed.y * scale + offsetY };
};

const getObjectCoverLayout = (
	containerWidth: number,
	containerHeight: number,
	naturalWidth: number,
	naturalHeight: number,
	objectPositionXPercent: number,
	objectPositionYPercent: number,
): ObjectCoverLayout => {
	const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);
	const renderedWidth = naturalWidth * scale;
	const renderedHeight = naturalHeight * scale;

	return {
		scale,
		offsetX: (containerWidth - renderedWidth) * (objectPositionXPercent / 100),
		offsetY: (containerHeight - renderedHeight) * (objectPositionYPercent / 100),
	};
};
