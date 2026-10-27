'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type KeyboardEvent, type MouseEvent, type PointerEvent, useId, useRef } from 'react';
import { Button } from '../../actions/button/button';
import { Textarea } from '../textarea/textarea';

/** `x` and `y` are fractions of the image size (0–1), measured from the top-left corner. */
export type ImageComment = { id: string; x: number; y: number; text: string };

type ImageCommentEditorProps = {
	src: string;
	alt: string;
	comments: ImageComment[];
	onCommentsChange: (comments: ImageComment[]) => void;
	maxComments: number;
	maxLength: number;
	disabled?: boolean;
	labels: {
		/** Accessible name of the image surface that places a new comment. */
		addComment: string;
		/** Prefix for numbered pins and fields, e.g. "Comment" → "Comment 2". */
		comment: string;
		remove: string;
		placeholder: string;
		empty: string;
	};
};

const KEYBOARD_STEP = 0.01;
const KEYBOARD_STEP_LARGE = 0.05;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const ARROW_KEYS: Record<string, { x: number; y: number }> = {
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
};

export const ImageCommentEditor = ({
	src,
	alt,
	comments,
	onCommentsChange,
	maxComments,
	maxLength,
	disabled = false,
	labels,
}: ImageCommentEditorProps) => {
	const fieldIdPrefix = useId();
	const frameRef = useRef<HTMLDivElement>(null);
	const canAdd = !disabled && comments.length < maxComments;

	const pointerPosition = (event: { clientX: number; clientY: number }) => {
		const bounds = frameRef.current?.getBoundingClientRect();
		if (!bounds?.width || !bounds.height) {
			return null;
		}

		return {
			x: clamp((event.clientX - bounds.left) / bounds.width),
			y: clamp((event.clientY - bounds.top) / bounds.height),
		};
	};

	const updateComment = (id: string, change: Partial<ImageComment>) =>
		onCommentsChange(comments.map((comment) => (comment.id === id ? { ...comment, ...change } : comment)));

	const addComment = (event: MouseEvent<HTMLButtonElement>) => {
		// Keyboard activation has no pointer position, so the pin starts centered and moves with the arrow keys.
		const position = event.detail === 0 ? { x: 0.5, y: 0.5 } : pointerPosition(event);
		if (!position) {
			return;
		}
		onCommentsChange([...comments, { id: crypto.randomUUID(), ...position, text: '' }]);
	};

	const movePinWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>, comment: ImageComment) => {
		const direction = ARROW_KEYS[event.key];
		if (!direction) {
			return;
		}
		event.preventDefault();
		const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
		updateComment(comment.id, { x: clamp(comment.x + direction.x * step), y: clamp(comment.y + direction.y * step) });
	};

	const movePinWithPointer = (event: PointerEvent<HTMLButtonElement>, comment: ImageComment) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
			return;
		}
		const position = pointerPosition(event);
		if (position) {
			updateComment(comment.id, position);
		}
	};

	return (
		<div className="grid min-h-0 flex-1 grid-rows-[minmax(12rem,3fr)_minmax(10rem,2fr)] gap-4 md:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] md:grid-rows-1">
			<div className="bg-muted/30 [container-type:size] flex min-h-0 items-center justify-center rounded-2xl border p-2">
				<div ref={frameRef} className="relative">
					<Image
						src={src}
						alt={alt}
						width={0}
						height={0}
						unoptimized
						className="block h-auto max-h-[100cqh] w-auto max-w-[100cqw] rounded-xl"
					/>
					<button
						type="button"
						aria-label={labels.addComment}
						disabled={!canAdd}
						onClick={addComment}
						className="focus-visible:ring-ring absolute inset-0 cursor-crosshair rounded-xl focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
					/>
					{comments.map((comment, index) => (
						<button
							key={comment.id}
							type="button"
							disabled={disabled}
							aria-label={`${labels.comment} ${index + 1}`}
							style={{ left: `${comment.x * 100}%`, top: `${comment.y * 100}%` }}
							className="bg-primary text-primary-foreground shadow-raised focus-visible:ring-ring absolute flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-white text-sm font-bold select-none focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing disabled:cursor-default"
							onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
							onPointerMove={(event) => movePinWithPointer(event, comment)}
							onClick={() => document.getElementById(`${fieldIdPrefix}-${comment.id}`)?.focus()}
							onKeyDown={(event) => movePinWithKeyboard(event, comment)}
						>
							{index + 1}
						</button>
					))}
				</div>
			</div>

			<ol className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain">
				{comments.length === 0 && <li className="text-muted-foreground text-sm">{labels.empty}</li>}
				{comments.map((comment, index) => (
					<li key={comment.id} className="bg-card flex gap-3 rounded-2xl border p-3">
						<span
							aria-hidden="true"
							className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>
							{index + 1}
						</span>
						<Textarea
							id={`${fieldIdPrefix}-${comment.id}`}
							variant="bare"
							resize="none"
							rows={3}
							autoFocus
							aria-label={`${labels.comment} ${index + 1}`}
							placeholder={labels.placeholder}
							maxLength={maxLength}
							disabled={disabled}
							value={comment.text}
							onChange={(event) => updateComment(comment.id, { text: event.target.value })}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							disabled={disabled}
							aria-label={`${labels.remove} ${labels.comment} ${index + 1}`}
							onClick={() => onCommentsChange(comments.filter((item) => item.id !== comment.id))}
						>
							<Trash2 aria-hidden="true" />
						</Button>
					</li>
				))}
			</ol>
		</div>
	);
};
