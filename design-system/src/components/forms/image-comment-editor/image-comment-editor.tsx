'use client';

import { MapPin, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '../../actions/button/button';
import { Textarea } from '../textarea/textarea';

export type ImageComment = { x: number; y: number; text: string };

type ImageCommentEditorProps = {
	src: string;
	alt: string;
	disabled?: boolean;
	maxComments: number;
	maxLength: number;
	onApply: (comments: ImageComment[]) => void;
	onCancel: () => void;
	header?: ReactNode;
	feedback?: ReactNode;
	labels: {
		place: string;
		loading: string;
		loadError: string;
		comment: string;
		comments: string;
		cancel: string;
		placeholder: string;
		remove: string;
		empty: string;
		apply: string;
		pending: string;
	};
};

export const ImageCommentEditor = ({
	src,
	alt,
	disabled = false,
	maxComments,
	maxLength,
	onApply,
	onCancel,
	header,
	feedback,
	labels,
}: ImageCommentEditorProps) => {
	const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
	const [loadError, setLoadError] = useState(false);
	const [comments, setComments] = useState<(ImageComment & { id: number })[]>([]);
	const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
	const inputRefs = useRef(new Map<number, HTMLTextAreaElement>());
	const nextId = useRef(0);
	const previewRef = useRef<HTMLDivElement>(null);
	const imageFrameRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{
		id: number;
		pointerId: number;
		startX: number;
		startY: number;
		offsetX: number;
		offsetY: number;
	} | null>(null);
	const didDragRef = useRef(false);
	const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		const preview = previewRef.current;
		if (!preview) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			setPreviewSize({ width: entry.contentRect.width, height: entry.contentRect.height });
		});
		observer.observe(preview);

		return () => observer.disconnect();
	}, []);
	const scale = dimensions ? Math.min(previewSize.width / dimensions.width, previewSize.height / dimensions.height) : 0;
	const canPlace = !disabled && dimensions !== null && !loadError && comments.length < maxComments;
	const addComment = (x: number, y: number) => {
		if (!canPlace || !dimensions) {
			return;
		}
		setComments([
			...comments,
			{
				id: nextId.current++,
				x: Math.min(dimensions.width - 1, Math.max(0, x)),
				y: Math.min(dimensions.height - 1, Math.max(0, y)),
				text: '',
			},
		]);
	};
	const moveComment = (id: number, x: number, y: number) => {
		if (disabled || !dimensions) {
			return;
		}
		setComments((previous) =>
			previous.map((comment) =>
				comment.id === id
					? {
							...comment,
							x: Math.min(dimensions.width - 1, Math.max(0, x)),
							y: Math.min(dimensions.height - 1, Math.max(0, y)),
						}
					: comment,
			),
		);
	};
	const updateDragPosition = (event: PointerEvent<HTMLButtonElement>) => {
		const drag = dragRef.current;
		const frame = imageFrameRef.current;
		if (disabled || !dimensions || !frame || drag?.pointerId !== event.pointerId) {
			return;
		}
		if (!didDragRef.current && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 3) {
			return;
		}
		const bounds = frame.getBoundingClientRect();
		if (bounds.width === 0 || bounds.height === 0) {
			return;
		}
		didDragRef.current = true;
		moveComment(
			drag.id,
			((event.clientX - bounds.left) * dimensions.width) / bounds.width - drag.offsetX,
			((event.clientY - bounds.top) * dimensions.height) / bounds.height - drag.offsetY,
		);
	};
	const clearDrag = (event: PointerEvent<HTMLButtonElement>) => {
		if (dragRef.current?.pointerId === event.pointerId) {
			dragRef.current = null;
		}
	};

	return (
		<div className="@container flex min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-4 sm:[@media(max-height:30rem)]:gap-2">
			{header && (
				<div className="border-border flex shrink-0 flex-col gap-1.5 border-b pr-8 pb-4 sm:pb-6 sm:[@media(max-height:30rem)]:pb-4">
					{header}
				</div>
			)}
			<div className="grid min-h-0 flex-1 grid-rows-[minmax(10rem,0.8fr)_minmax(12rem,1.2fr)] gap-3 overflow-y-auto overscroll-contain @min-[40rem]:grid-cols-[minmax(0,2.1fr)_minmax(16rem,1fr)] @min-[40rem]:grid-rows-1 @min-[40rem]:gap-4 @min-[40rem]:overflow-hidden">
				<div
					ref={previewRef}
					className="border-border bg-muted/20 flex min-h-0 min-w-0 items-center justify-center rounded-2xl border p-2"
				>
					<div
						ref={imageFrameRef}
						className="relative inline-flex"
						style={{ width: dimensions ? dimensions.width * scale : 1, height: dimensions ? dimensions.height * scale : 1 }}
					>
						<Image
							src={src}
							alt={alt}
							width={dimensions?.width ?? 2048}
							height={dimensions?.height ?? 2048}
							unoptimized
							className="block h-full w-full rounded-xl"
							onLoad={(event) =>
								setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
							}
							onError={() => setLoadError(true)}
						/>
						{dimensions && !loadError && (
							<>
								<button
									type="button"
									aria-label={labels.place}
									disabled={!canPlace}
									className="group focus-visible:ring-ring absolute inset-0 cursor-crosshair rounded-lg focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
									onClick={(event) => {
										const bounds = event.currentTarget.getBoundingClientRect();
										addComment(
											event.detail === 0
												? cursor.x * dimensions.width
												: ((event.clientX - bounds.left) * dimensions.width) / bounds.width,
											event.detail === 0
												? cursor.y * dimensions.height
												: ((event.clientY - bounds.top) * dimensions.height) / bounds.height,
										);
									}}
									onKeyDown={(event) => {
										const x = event.key === 'ArrowRight' ? 0.01 : event.key === 'ArrowLeft' ? -0.01 : 0;
										const y = event.key === 'ArrowDown' ? 0.01 : event.key === 'ArrowUp' ? -0.01 : 0;
										if (x === 0 && y === 0) {
											return;
										}
										event.preventDefault();
										setCursor((point) => ({
											x: Math.max(0, Math.min(1, point.x + x)),
											y: Math.max(0, Math.min(1, point.y + y)),
										}));
									}}
								>
									<span
										className="bg-primary text-primary-foreground absolute hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full group-focus-visible:block"
										style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
									/>
								</button>
								{comments.map((comment, index) => (
									<button
										key={comment.id}
										type="button"
										disabled={disabled}
										aria-label={`${labels.comment} ${index + 1}`}
										className="bg-primary text-primary-foreground focus-visible:ring-ring shadow-raised absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-white text-sm font-bold select-none focus-visible:ring-2 active:cursor-grabbing disabled:cursor-default @min-[40rem]:h-9 @min-[40rem]:w-9"
										style={{
											left: `${(comment.x / dimensions.width) * 100}%`,
											top: `${(comment.y / dimensions.height) * 100}%`,
										}}
										onPointerDown={(event) => {
											if (disabled || event.button !== 0 || dragRef.current || !imageFrameRef.current) {
												return;
											}
											const bounds = imageFrameRef.current.getBoundingClientRect();
											if (bounds.width === 0 || bounds.height === 0) {
												return;
											}
											event.currentTarget.setPointerCapture(event.pointerId);
											didDragRef.current = false;
											dragRef.current = {
												id: comment.id,
												pointerId: event.pointerId,
												startX: event.clientX,
												startY: event.clientY,
												offsetX: ((event.clientX - bounds.left) * dimensions.width) / bounds.width - comment.x,
												offsetY: ((event.clientY - bounds.top) * dimensions.height) / bounds.height - comment.y,
											};
										}}
										onPointerMove={updateDragPosition}
										onPointerUp={(event) => {
											if (dragRef.current?.pointerId !== event.pointerId) {
												return;
											}
											updateDragPosition(event);
											dragRef.current = null;
											event.currentTarget.releasePointerCapture(event.pointerId);
										}}
										onLostPointerCapture={clearDrag}
										onPointerCancel={clearDrag}
										onClick={(event) => {
											if (didDragRef.current && event.detail !== 0) {
												didDragRef.current = false;

												return;
											}
											didDragRef.current = false;
											inputRefs.current.get(comment.id)?.focus();
										}}
										onKeyDown={(event) => {
											const x = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
											const y = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
											if (x === 0 && y === 0) {
												return;
											}
											event.preventDefault();
											const step = event.shiftKey ? 10 : 1;
											moveComment(comment.id, comment.x + x * step, comment.y + y * step);
										}}
									>
										{index + 1}
									</button>
								))}
							</>
						)}
					</div>
				</div>
				<div className="border-border bg-card flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border p-3 @min-[40rem]:p-4">
					<div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
						<h3 className="text-lg font-semibold">
							{labels.comments} ({comments.length})
						</h3>
					</div>
					{!dimensions && !loadError && <p role="status">{labels.loading}</p>}
					{loadError && <p role="alert">{labels.loadError}</p>}
					{comments.length === 0 && <p className="text-muted-foreground text-sm">{labels.empty}</p>}
					<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
						{comments.map((comment, index) => (
							<div key={comment.id} className="border-border bg-muted/30 flex shrink-0 flex-col gap-3 rounded-xl border p-3">
								<div className="flex items-center justify-between gap-2">
									<span className="flex items-center gap-2 text-sm font-medium">
										<span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
											{index + 1}
										</span>
										{labels.comment} {index + 1}
									</span>
									<Button
										type="button"
										variant="ghost"
										disabled={disabled}
										aria-label={`${labels.remove} ${labels.comment} ${index + 1}`}
										onClick={() => setComments(comments.filter((item) => item.id !== comment.id))}
									>
										<span className="hidden @min-[64rem]:inline">{labels.remove}</span>
										<Trash2 aria-hidden="true" />
									</Button>
								</div>
								<div className="border-border bg-background focus-within:border-ring focus-within:ring-ring/50 flex shrink-0 flex-col rounded-2xl border p-3 text-base leading-6 shadow-xs focus-within:ring-[3px] lg:text-sm">
									<Textarea
										variant="bare"
										autoFocus
										ref={(element) => {
											if (element) {
												inputRefs.current.set(comment.id, element);
											} else {
												inputRefs.current.delete(comment.id);
											}
										}}
										aria-label={`${labels.comment} ${index + 1}`}
										value={comment.text}
										disabled={disabled}
										maxLength={maxLength}
										placeholder={labels.placeholder}
										rows={3}
										onChange={(event) =>
											setComments(
												comments.map((item) => (item.id === comment.id ? { ...item, text: event.target.value } : item)),
											)
										}
									/>
								</div>
								<p className="text-muted-foreground flex items-center gap-2 text-xs">
									<MapPin className="h-4 w-4" aria-hidden="true" />
									x: {comment.x.toFixed(2)}, y: {comment.y.toFixed(2)}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="border-border flex shrink-0 flex-col gap-3 border-t pt-3 sm:pt-4 sm:[@media(max-height:30rem)]:pt-2">
				{feedback}
				<div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 @min-[40rem]:flex @min-[40rem]:justify-end">
					<Button type="button" variant="outline" disabled={disabled} onClick={onCancel}>
						{labels.cancel}
					</Button>
					<Button
						type="button"
						disabled={
							disabled ||
							!dimensions ||
							loadError ||
							comments.length === 0 ||
							comments.some((comment) => !comment.text.trim())
						}
						onClick={() => onApply(comments.map(({ x, y, text }) => ({ x, y, text })))}
					>
						{disabled ? labels.pending : labels.apply}
					</Button>
				</div>
			</div>
		</div>
	);
};
