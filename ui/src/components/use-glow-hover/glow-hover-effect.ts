'use client';

import { linearAnimation } from './linear-animation';
import { presets } from './presets';

export type GlowHoverOptions = {
	hoverBg?: string;
	lightSize?: number;
	lightSizeEnterAnimationTime?: number;
	lightSizeLeaveAnimationTime?: number;
	isElementMovable?: boolean;
	customStaticBg?: string;
	enableBurst?: boolean;
} & (
	| {
			preset: keyof typeof presets;
			lightColor?: string;
	  }
	| {
			preset?: undefined;
			lightColor: string;
	  }
);

type Coords = {
	x: number;
	y: number;
};

const BURST_TIME = 300;

export function parseColor(colorToParse: string) {
	const div = document.createElement('div');
	div.style.color = colorToParse;
	div.style.position = 'absolute';
	div.style.display = 'none';
	document.body.appendChild(div);
	const colorFromEl = getComputedStyle(div).color;
	document.body.removeChild(div);
	const parsedColor = colorFromEl.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
	if (parsedColor) {
		const alpha = typeof parsedColor[4] === 'undefined' ? 1 : parsedColor[4];
		return [parsedColor[1], parsedColor[2], parsedColor[3], alpha];
	} else {
		console.error(`Color ${colorToParse} could not be parsed.`);
		return [0, 0, 0, 0];
	}
}

export const glowHoverEffect = <T extends HTMLElement>(el: T, { preset, ...options }: GlowHoverOptions) => {
	if (!el) {
		return () => {};
	}

	const lightColor = options.lightColor ?? '#CEFF00';
	const lightSize = options.lightSize ?? 130;
	const lightSizeEnterAnimationTime = options.lightSizeEnterAnimationTime ?? 100;
	const lightSizeLeaveAnimationTime = options.lightSizeLeaveAnimationTime ?? 50;
	const isElementMovable = options.isElementMovable ?? false;
	const customStaticBg = options.customStaticBg ?? null;

	const enableBurst = options.enableBurst ?? false;

	const getResolvedHoverBg = () => getComputedStyle(el).backgroundColor;

	let resolvedHoverBg = getResolvedHoverBg();

	// default bg (if not defined) is rgba(0, 0, 0, 0) which is bugged in gradients in Safari
	// so we use transparent lightColor instead
	const parsedLightColor = parseColor(lightColor);
	const parsedLightColorRGBString = parsedLightColor.slice(0, 3).join(',');
	const resolvedGradientBg = `rgba(${parsedLightColorRGBString},0)`;

	let isMouseInside = false;
	let currentLightSize = 0;
	let blownSize = 0;
	let lightSizeEnterAnimationId: number | undefined = undefined;
	let lightSizeLeaveAnimationId: number | undefined = undefined;
	let blownSizeIncreaseAnimationId: number | undefined = undefined;
	let blownSizeDecreaseAnimationId: number | undefined = undefined;
	let lastMousePos: Coords;
	const defaultBox = el.getBoundingClientRect();
	let lastElPos: Coords = { x: defaultBox.left, y: defaultBox.top };

	const updateGlowEffect = () => {
		if (!lastMousePos) {
			return;
		}
		const gradientXPos = lastMousePos.x - lastElPos.x;
		const gradientYPos = lastMousePos.y - lastElPos.y;
		// we do not use transparent color here because of dirty gradient in Safari (more info: https://stackoverflow.com/questions/38391457/linear-gradient-to-transparent-bug-in-latest-safari)
		const gradient = `radial-gradient(circle at ${gradientXPos}px ${gradientYPos}px, ${lightColor} 0%, ${resolvedGradientBg} calc(${
			blownSize * 2.5
		}% + ${currentLightSize}px)) no-repeat`;

		// we duplicate resolvedHoverBg layer here because of transition "blinking" without it
		el.style.background = `${gradient} border-box border-box ${resolvedHoverBg}`;
	};

	const updateEffectWithPosition = () => {
		if (isMouseInside) {
			const curBox = el.getBoundingClientRect();
			lastElPos = { x: curBox.left, y: curBox.top };
			updateGlowEffect();
		}
	};

	const onMouseEnter = (e: MouseEvent) => {
		resolvedHoverBg = getResolvedHoverBg();
		lastMousePos = { x: e.clientX, y: e.clientY };
		const curBox = el.getBoundingClientRect();
		lastElPos = { x: curBox.left, y: curBox.top };
		isMouseInside = true;
		if (lightSizeEnterAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeEnterAnimationId);
		}
		if (lightSizeLeaveAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeLeaveAnimationId);
		}

		// animate currentLightSize from 0 to lightSize
		linearAnimation({
			onProgress: (progress) => {
				currentLightSize = lightSize * progress;
				updateGlowEffect();
			},
			time: lightSizeEnterAnimationTime,
			initialProgress: currentLightSize / lightSize,
			onIdUpdate: (newId) => (lightSizeEnterAnimationId = newId),
		});
	};

	const onMouseMove = (e: MouseEvent) => {
		lastMousePos = { x: e.clientX, y: e.clientY };
		if (isElementMovable) {
			updateEffectWithPosition();
		} else {
			updateGlowEffect();
		}
	};

	const onMouseLeave = () => {
		isMouseInside = false;
		if (lightSizeEnterAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeEnterAnimationId);
		}
		if (lightSizeLeaveAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeLeaveAnimationId);
		}
		if (blownSizeIncreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeIncreaseAnimationId);
		}
		if (blownSizeDecreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeDecreaseAnimationId);
		}

		// animate currentLightSize from lightSize to 0
		linearAnimation({
			onProgress: (progress) => {
				currentLightSize = lightSize * (1 - progress);
				blownSize = Math.min(blownSize, (1 - progress) * 100);

				if (progress < 1) {
					updateGlowEffect();
				} else {
					el.style.background = customStaticBg ? customStaticBg : '';
				}
			},
			time: lightSizeLeaveAnimationTime,
			initialProgress: 1 - currentLightSize / lightSize,
			onIdUpdate: (newId) => (lightSizeLeaveAnimationId = newId),
		});
	};

	const onMouseDown = (e: MouseEvent) => {
		lastMousePos = { x: e.clientX, y: e.clientY };
		const curBox = el.getBoundingClientRect();
		lastElPos = { x: curBox.left, y: curBox.top };
		if (blownSizeIncreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeIncreaseAnimationId);
		}
		if (blownSizeDecreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeDecreaseAnimationId);
		}

		// animate blownSize from 0 to 100
		linearAnimation({
			onProgress: (progress) => {
				blownSize = 100 * progress;
				updateGlowEffect();
			},
			time: BURST_TIME,
			initialProgress: blownSize / 100,
			onIdUpdate: (newId) => (blownSizeIncreaseAnimationId = newId),
		});
	};

	const onMouseUp = (e: MouseEvent) => {
		lastMousePos = { x: e.clientX, y: e.clientY };
		const curBox = el.getBoundingClientRect();
		lastElPos = { x: curBox.left, y: curBox.top };
		if (blownSizeIncreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeIncreaseAnimationId);
		}
		if (blownSizeDecreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeDecreaseAnimationId);
		}

		// animate blownSize from 100 to 0
		linearAnimation({
			onProgress: (progress) => {
				blownSize = (1 - progress) * 100;
				updateGlowEffect();
			},
			time: BURST_TIME,
			initialProgress: 1 - blownSize / 100,
			onIdUpdate: (newId) => (blownSizeDecreaseAnimationId = newId),
		});
	};

	document.addEventListener('scroll', updateEffectWithPosition);
	window.addEventListener('resize', updateEffectWithPosition);
	el.addEventListener('mouseenter', onMouseEnter);
	el.addEventListener('mousemove', onMouseMove);
	el.addEventListener('mouseleave', onMouseLeave);
	if (enableBurst) {
		el.addEventListener('mousedown', onMouseDown);
		el.addEventListener('mouseup', onMouseUp);
	}

	let resizeObserver: ResizeObserver;
	if (window.ResizeObserver) {
		resizeObserver = new ResizeObserver(updateEffectWithPosition);
		resizeObserver.observe(el);
	}

	return () => {
		if (lightSizeEnterAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeEnterAnimationId);
		}
		if (lightSizeLeaveAnimationId !== undefined) {
			window.cancelAnimationFrame(lightSizeLeaveAnimationId);
		}
		if (blownSizeIncreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeIncreaseAnimationId);
		}
		if (blownSizeDecreaseAnimationId !== undefined) {
			window.cancelAnimationFrame(blownSizeDecreaseAnimationId);
		}

		document.removeEventListener('scroll', updateEffectWithPosition);
		window.removeEventListener('resize', updateEffectWithPosition);
		el.removeEventListener('mouseenter', onMouseEnter);
		el.removeEventListener('mousemove', onMouseMove);
		el.removeEventListener('mouseleave', onMouseLeave);
		if (enableBurst) {
			el.removeEventListener('mousedown', onMouseDown);
			el.removeEventListener('mouseup', onMouseUp);
		}

		if (resizeObserver) {
			resizeObserver.unobserve(el);
			resizeObserver.disconnect();
		}
	};
};
