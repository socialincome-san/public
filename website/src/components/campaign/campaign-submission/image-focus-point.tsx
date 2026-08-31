'use client';

import { cn } from '@/lib/utils/cn';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { clickToStoryblokFocus, focusToMarkerPosition, focusToObjectPosition } from './storyblok-image-focus';

type ImageFocusPointProps = {
	previewUrl: string;
	focus: string | null;
	onFocusChange: (focus: string) => void;
	aspectRatio: number;
	shape: 'rect' | 'circle';
	disabled?: boolean;
	ariaLabel: string;
	className?: string;
	imgClassName?: string;
};

export const ImageFocusPoint = ({
	previewUrl,
	focus,
	onFocusChange,
	aspectRatio,
	shape,
	disabled = false,
	ariaLabel,
	className,
	imgClassName,
}: ImageFocusPointProps) => {
	const frameRef = useRef<HTMLButtonElement>(null);
	const [loadedImage, setLoadedImage] = useState<{
		url: string;
		width: number;
		height: number;
	} | null>(null);
	const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

	const naturalSize = loadedImage?.url === previewUrl ? { width: loadedImage.width, height: loadedImage.height } : null;

	useEffect(() => {
		const image = new Image();
		let cancelled = false;

		image.onload = () => {
			if (!cancelled) {
				setLoadedImage({
					url: previewUrl,
					width: image.naturalWidth,
					height: image.naturalHeight,
				});
			}
		};
		image.src = previewUrl;

		return () => {
			cancelled = true;
		};
	}, [previewUrl]);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) {
			return;
		}

		const updateFrameSize = () => {
			const rect = frame.getBoundingClientRect();
			setFrameSize({ width: rect.width, height: rect.height });
		};

		const animationFrame = requestAnimationFrame(updateFrameSize);
		const observer = new ResizeObserver(updateFrameSize);
		observer.observe(frame);

		return () => {
			cancelAnimationFrame(animationFrame);
			observer.disconnect();
		};
	}, [previewUrl, naturalSize]);

	const markerPosition =
		focus && naturalSize && frameSize
			? focusToMarkerPosition(focus, frameSize.width, frameSize.height, naturalSize.width, naturalSize.height)
			: null;

	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (disabled || !naturalSize || !frameRef.current) {
				return;
			}

			const rect = frameRef.current.getBoundingClientRect();
			const clickX = event.clientX - rect.left;
			const clickY = event.clientY - rect.top;
			const nextFocus = clickToStoryblokFocus(
				clickX,
				clickY,
				rect.width,
				rect.height,
				naturalSize.width,
				naturalSize.height,
				focus,
			);
			onFocusChange(nextFocus);
		},
		[disabled, focus, naturalSize, onFocusChange],
	);

	const objectPosition =
		naturalSize !== null ? focusToObjectPosition(focus, naturalSize.width, naturalSize.height) : '50% 50%';

	return (
		<button
			ref={frameRef}
			type="button"
			disabled={disabled}
			aria-label={ariaLabel}
			onClick={handleClick}
			className={cn(
				'relative block size-full overflow-hidden',
				!disabled && 'cursor-crosshair',
				shape === 'circle' && 'rounded-full',
				className,
			)}
			style={{ aspectRatio }}
		>
			{/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
			<img
				src={previewUrl}
				alt=""
				className={cn('size-full object-cover', shape === 'circle' && 'rounded-full', imgClassName)}
				style={{ objectPosition }}
			/>
			{markerPosition ? (
				<span
					aria-hidden
					className="border-primary bg-primary/30 pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
					style={{ left: markerPosition.x, top: markerPosition.y }}
				/>
			) : null}
		</button>
	);
};
