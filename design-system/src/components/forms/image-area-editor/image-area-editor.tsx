'use client';

import { Brush, Check, Eraser, Redo2, Trash2, Undo2 } from 'lucide-react';
import { type PointerEvent, type ReactNode, useRef, useState } from 'react';
import { Button } from '../../actions/button/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';
import { Slider } from '../slider/slider';

type Point = { x: number; y: number };
type Stroke = { points: Point[]; size: number; erase: boolean };

type ImageAreaEditorProps = {
	children: ReactNode;
	width: number;
	height: number;
	active: boolean;
	mode: 'remove' | 'change';
	onModeChange: (mode: 'remove' | 'change') => void;
	onSelectionChange: (mask: string | null) => void;
	onDone: () => void;
	onCancel: () => void;
	labels: {
		selection: string;
		remove: string;
		removeHelp: string;
		change: string;
		changeHelp: string;
		brush: string;
		brushHelp: string;
		eraser: string;
		eraserHelp: string;
		size: string;
		undo: string;
		undoHelp: string;
		redo: string;
		redoHelp: string;
		clear: string;
		clearHelp: string;
		done: string;
		cancel: string;
		help: string;
	};
};

export const ImageAreaEditor = ({
	children,
	width,
	height,
	active,
	mode,
	onModeChange,
	onSelectionChange,
	onDone,
	onCancel,
	labels,
}: ImageAreaEditorProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const strokes = useRef<Stroke[]>([]);
	const undoneStrokes = useRef<Stroke[]>([]);
	const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null);
	const [eraser, setEraser] = useState(false);
	const [size, setSize] = useState(32);
	const [undoCount, setUndoCount] = useState(0);
	const [redoCount, setRedoCount] = useState(0);
	const [drawing, setDrawing] = useState(false);
	const cursorSize = size + 4;
	const cursorCenter = cursorSize / 2;
	const cursor = encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}"><circle cx="${cursorCenter}" cy="${cursorCenter}" r="${size / 2}" fill="none" stroke="white" stroke-width="3"/><circle cx="${cursorCenter}" cy="${cursorCenter}" r="${size / 2}" fill="none" stroke="black" stroke-width="1"/></svg>`,
	);

	const draw = (stroke: Stroke) => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		if (!canvas || !context) {
			return;
		}
		context.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
		context.strokeStyle = getComputedStyle(canvas).color;
		context.fillStyle = context.strokeStyle;
		context.lineWidth = stroke.size;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.beginPath();
		const first = stroke.points[0];
		context.moveTo(first.x, first.y);
		for (const point of stroke.points) {
			context.lineTo(point.x, point.y);
		}
		context.stroke();
		context.beginPath();
		context.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
		context.fill();
	};

	const publish = () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		if (!canvas || !context) {
			return;
		}
		const pixels = context.getImageData(0, 0, width, height).data;
		const selected = pixels.some((value, index) => index % 4 === 3 && value > 0);
		onSelectionChange(selected ? canvas.toDataURL('image/png') : null);
		setUndoCount(strokes.current.length);
		setRedoCount(undoneStrokes.current.length);
	};

	const redrawSelection = () => {
		canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
		strokes.current.forEach(draw);
		publish();
	};

	const clearSelection = () => {
		strokes.current = [];
		undoneStrokes.current = [];
		redrawSelection();
	};

	const pointAt = (event: PointerEvent<HTMLCanvasElement>): Point => {
		const bounds = event.currentTarget.getBoundingClientRect();

		return {
			x: ((event.clientX - bounds.left) * width) / bounds.width,
			y: ((event.clientY - bounds.top) * height) / bounds.height,
		};
	};

	const finish = (event: PointerEvent<HTMLCanvasElement>) => {
		if (current.current?.pointerId !== event.pointerId) {
			return;
		}
		strokes.current.push(current.current.stroke);
		undoneStrokes.current = [];
		current.current = null;
		setDrawing(false);
		redrawSelection();
	};

	return (
		<div className="flex max-w-full flex-col items-center gap-3">
			<div className="relative max-w-full">
				{children}
				<canvas
					ref={canvasRef}
					width={width}
					height={height}
					aria-label={labels.selection}
					className={`text-primary absolute inset-0 h-full w-full rounded-3xl opacity-55 ${active ? 'touch-none' : 'pointer-events-none'}`}
					style={
						active ? { cursor: `url("data:image/svg+xml,${cursor}") ${cursorCenter} ${cursorCenter}, auto` } : undefined
					}
					onPointerDown={(event) => {
						if (!active || current.current || event.button !== 0) {
							return;
						}
						event.currentTarget.setPointerCapture(event.pointerId);
						const stroke = {
							points: [pointAt(event)],
							size: (size * width) / event.currentTarget.getBoundingClientRect().width,
							erase: eraser,
						};
						current.current = { pointerId: event.pointerId, stroke };
						setDrawing(true);
						draw(stroke);
					}}
					onPointerMove={(event) => {
						if (current.current?.pointerId !== event.pointerId) {
							return;
						}
						const stroke = current.current.stroke;
						const previous = stroke.points[stroke.points.length - 1];
						const point = pointAt(event);
						stroke.points.push(point);
						draw({ ...stroke, points: [previous, point] });
					}}
					onPointerUp={finish}
					onPointerCancel={finish}
					onLostPointerCapture={finish}
				/>
			</div>
			{active && (
				<>
					<div
						className="border-input bg-card shadow-card flex flex-wrap items-center justify-center gap-3 rounded-3xl border p-3"
						role="group"
						aria-label={labels.selection}
					>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="md"
									variant={mode === 'remove' ? 'secondary' : 'ghost'}
									aria-pressed={mode === 'remove'}
									disabled={drawing}
									onClick={() => onModeChange('remove')}
								>
									{labels.remove}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.removeHelp}
							</TooltipContent>
						</Tooltip>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="md"
									variant={mode === 'change' ? 'secondary' : 'ghost'}
									aria-pressed={mode === 'change'}
									disabled={drawing}
									onClick={() => onModeChange('change')}
								>
									{labels.change}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.changeHelp}
							</TooltipContent>
						</Tooltip>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="icon"
									variant={!eraser ? 'secondary' : 'ghost'}
									aria-label={labels.brush}
									aria-pressed={!eraser}
									disabled={drawing}
									onClick={() => setEraser(false)}
								>
									<Brush aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.brushHelp}
							</TooltipContent>
						</Tooltip>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="icon"
									variant={eraser ? 'secondary' : 'ghost'}
									aria-label={labels.eraser}
									aria-pressed={eraser}
									disabled={drawing}
									onClick={() => setEraser(true)}
								>
									<Eraser aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.eraserHelp}
							</TooltipContent>
						</Tooltip>
						<div className="flex w-40 items-center gap-3 text-sm">
							<span>{labels.size}</span>
							<Slider
								aria-label={labels.size}
								min={4}
								max={100}
								value={[size]}
								disabled={drawing}
								onValueChange={([value]) => setSize(value)}
							/>
							<output>{size}</output>
						</div>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									aria-label={labels.undo}
									disabled={drawing || undoCount === 0}
									onClick={() => {
										const stroke = strokes.current.pop();
										if (stroke) {
											undoneStrokes.current.push(stroke);
										}
										redrawSelection();
									}}
								>
									<Undo2 aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.undoHelp}
							</TooltipContent>
						</Tooltip>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									aria-label={labels.redo}
									disabled={drawing || redoCount === 0}
									onClick={() => {
										const stroke = undoneStrokes.current.pop();
										if (stroke) {
											strokes.current.push(stroke);
										}
										redrawSelection();
									}}
								>
									<Redo2 aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.redoHelp}
							</TooltipContent>
						</Tooltip>
						<Tooltip delayDuration={500}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									aria-label={labels.clear}
									disabled={drawing || undoCount === 0}
									onClick={clearSelection}
								>
									<Trash2 aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={8}>
								{labels.clearHelp}
							</TooltipContent>
						</Tooltip>
						<Button
							type="button"
							size="md"
							variant="ghost"
							disabled={drawing}
							onClick={() => {
								clearSelection();
								onCancel();
							}}
						>
							{labels.cancel}
						</Button>
						<Button type="button" size="md" disabled={drawing} onClick={onDone}>
							<Check aria-hidden="true" />
							{labels.done}
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">{labels.help}</p>
				</>
			)}
		</div>
	);
};
