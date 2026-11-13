'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { cn } from '../../../cn';
import { CountryFlag } from '../country-flag/country-flag';
import { type AfricaMapFrame, type AfricaMapShape } from './africa-map-geometry';

// The colours of the land and of what lies on it, with the light map and the gradient as the defaults. Shaded and
// hovered countries mix `--map-tint` into their land, `--map-lift` fills the country the popup belongs to and
// `--map-marker` its marker.
const stageVariants = cva(
	[
		'group/map relative w-full',
		'[--map-land:hsl(var(--background)/0.7)] [--map-line:hsl(var(--primary)/0.15)] [--map-line-hover:var(--map-line)]',
		'[--map-tint:hsl(var(--primary))] [--map-shade:7%] [--map-hover:10%] [--map-shadow:hsl(var(--primary)/0.15)]',
		'[--map-highlight-from:hsl(var(--gradient-button-from))] [--map-highlight-to:hsl(var(--gradient-button-to))]',
		'[--map-highlight-opacity:1] [--map-lift:hsl(var(--primary))] [--map-marker:hsl(var(--background))]',
		'[--map-ring:hsl(var(--background))]',
	].join(' '),
	{
		variants: {
			appearance: {
				light: '',
				blue: '[--map-land:hsl(var(--banner-blue))] [--map-line:hsl(var(--background)/0.85)] [--map-shade:9%]',
				dark: [
					'[--map-land:hsl(var(--primary))] [--map-line:hsl(var(--background)/0.2)] [--map-tint:hsl(var(--background))]',
					'[--map-shade:9%] [--map-shadow:hsl(var(--primary)/0.3)] [--map-lift:hsl(var(--background))]',
					'[--map-marker:hsl(var(--primary))]',
				].join(' '),
				// The land is the image below: only a hovered country shows its border
				satellite: [
					'[--map-land:transparent] [--map-line:transparent] [--map-line-hover:hsl(var(--background)/0.9)]',
					'[--map-tint:hsl(var(--background))] [--map-shade:16%] [--map-hover:14%] [--map-shadow:hsl(var(--primary)/0.3)]',
					'[--map-highlight-opacity:0.78]',
				].join(' '),
			},
			// Yellow and white stand out on the satellite image, which shares its colours with the gradient
			highlightColor: {
				gradient: '',
				yellow: [
					'[--map-highlight-from:hsl(var(--banner-yellow))] [--map-lift:hsl(var(--banner-yellow))]',
					'[--map-highlight-to:color-mix(in_srgb,hsl(var(--banner-yellow))_50%,hsl(var(--highlight)))]',
				].join(' '),
				// A white ring would vanish on white countries
				white: [
					'[--map-highlight-from:hsl(var(--background))] [--map-highlight-to:hsl(var(--banner-blue))]',
					'[--map-lift:hsl(var(--background))] [--map-ring:hsl(var(--primary))]',
				].join(' '),
			},
		},
		compoundVariants: [
			// Less of the image showing through than with the gradient, which would muddy the light colours
			{ appearance: 'satellite', highlightColor: ['yellow', 'white'], className: '[--map-highlight-opacity:0.9]' },
		],
	},
);

export type AfricaMapAppearance = NonNullable<VariantProps<typeof stageVariants>['appearance']>;
export type AfricaMapHighlightColor = NonNullable<VariantProps<typeof stageVariants>['highlightColor']>;

type AfricaMapHighlight = AfricaMapShape & {
	name: string;
	href?: string;
	detail?: string;
};

type AfricaMapStageProps = {
	label: string;
	appearance: AfricaMapAppearance;
	highlightColor: AfricaMapHighlightColor;
	// The part of the map that is shown, in the coordinates of the shapes
	frame: AfricaMapFrame;
	// The land goes on beyond the frame, which cuts it off
	cropped: boolean;
	highlights: AfricaMapHighlight[];
	// The land, drawn below the highlighted countries
	children: ReactNode;
	// Drawn above the highlighted countries, such as clouds
	overlay?: ReactNode;
};

type PopupState = {
	// Stays set while the popup fades out
	code: string | null;
	open: boolean;
	// The popup moves over from the previous country instead of appearing in place
	gliding: boolean;
	// The pointer left: the popup closes unless it comes back in time
	leaving: boolean;
};

type PopupAction = { type: 'show'; code: string } | { type: 'leave' } | { type: 'hide' };

const popupReducer = (state: PopupState, action: PopupAction): PopupState => {
	switch (action.type) {
		case 'show':
			return state.open && state.code === action.code && !state.leaving
				? state
				: { code: action.code, open: true, gliding: state.open, leaving: false };
		case 'leave':
			return state.open && !state.leaving ? { ...state, leaving: true } : state;
		case 'hide':
			return state.open ? { ...state, open: false, gliding: false, leaving: false } : state;
	}
};

// Half the size of a marker, with some tolerance
const MARKER_RADIUS = 8;
// A marker catches the pointer within this many px, so that countries of a few pixels can be hit
const HOVER_RADIUS = 14;
const TAP_RADIUS = 28;
// Countries that fit a smaller circle than this are hardly visible, so their marker gets a filled disc
const TINY_COUNTRY_RADIUS = 4;
// Long enough to move from a country into its popup
const LEAVE_DELAY = 150;
const REVEAL_STAGGER = 90;
const POPUP_GAP = 20;
const VIEWPORT_MARGIN = 12;
// The popup opens below its marker instead of sliding under the site header
const HEADER_CLEARANCE = 96;
// Keeps the arrow of a shifted popup clear of the rounded corners
const ARROW_INSET = 24;

const brandGradientClassName = 'bg-linear-to-br from-[hsl(var(--gradient-button-from))] to-[hsl(var(--gradient-button-to))]';

const isInPopup = (target: EventTarget) => target instanceof Element && target.closest('[data-popup]') !== null;

export const AfricaMapStage = ({
	label,
	appearance,
	highlightColor,
	frame,
	cropped,
	highlights,
	children,
	overlay,
}: AfricaMapStageProps) => {
	const gradientId = useId();
	const stageRef = useRef<HTMLDivElement>(null);
	const revealRef = useRef<HTMLSpanElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const arrowRef = useRef<HTMLSpanElement>(null);
	const pointerDownRef = useRef({ pointerType: 'mouse', x: 0, y: 0 });
	const [popup, dispatch] = useReducer(popupReducer, { code: null, open: false, gliding: false, leaving: false });
	const [revealed, setRevealed] = useState(false);

	const viewBox = `${frame.x} ${frame.y} ${frame.width} ${frame.height}`;
	const toLeft = (x: number) => (x - frame.x) / frame.width;
	const toTop = (y: number) => (y - frame.y) / frame.height;
	const shown = highlights.find(({ code }) => code === popup.code) ?? highlights[0];
	const activeCode = popup.open ? popup.code : null;
	const shownLeft = shown ? toLeft(shown.x) : 0;
	const shownTop = shown ? toTop(shown.y) : 0;

	useEffect(() => {
		const target = revealRef.current;
		if (!target || typeof IntersectionObserver === 'undefined') {
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) {
				setRevealed(true);
				observer.disconnect();
			}
		});
		observer.observe(target);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!popup.leaving) {
			return;
		}
		const timeout = setTimeout(() => dispatch({ type: 'hide' }), LEAVE_DELAY);

		return () => clearTimeout(timeout);
	}, [popup.leaving]);

	// A tap outside of the map closes the popup that a tap opened
	useEffect(() => {
		if (!popup.open) {
			return;
		}
		const onPointerDown = (event: globalThis.PointerEvent) => {
			if (event.target instanceof Node && !stageRef.current?.contains(event.target)) {
				dispatch({ type: 'hide' });
			}
		};
		document.addEventListener('pointerdown', onPointerDown);

		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [popup.open]);

	// Keeps the popup inside the viewport: it shifts sideways while its arrow stays on the marker, and it opens below
	// the marker when there is no room above
	useLayoutEffect(() => {
		const stage = stageRef.current;
		const card = cardRef.current;
		const arrow = arrowRef.current;
		if (!stage || !card || !arrow || !popup.open) {
			return;
		}
		const stageRect = stage.getBoundingClientRect();
		const anchorX = stageRect.left + shownLeft * stageRect.width;
		const anchorY = stageRect.top + shownTop * stageRect.height;
		const halfWidth = card.offsetWidth / 2;
		const overflowLeft = VIEWPORT_MARGIN + halfWidth - anchorX;
		const overflowRight = document.documentElement.clientWidth - VIEWPORT_MARGIN - halfWidth - anchorX;
		const maxShift = Math.max(0, halfWidth - ARROW_INSET);
		const shift = Math.min(maxShift, Math.max(-maxShift, overflowLeft, Math.min(0, overflowRight)));
		const below = anchorY - POPUP_GAP - card.offsetHeight < HEADER_CLEARANCE;

		card.style.translate = `calc(-50% + ${shift}px) ${below ? `${POPUP_GAP}px` : `calc(-100% - ${POPUP_GAP}px)`}`;
		card.style.transformOrigin = `calc(50% - ${shift}px) ${below ? '0%' : '100%'}`;
		arrow.style.translate = `calc(-50% - ${shift}px) ${below ? '-50%' : '50%'}`;
		arrow.style.top = below ? '0' : 'auto';
		arrow.style.bottom = below ? 'auto' : '0';
	}, [popup.open, shown?.code, shownLeft, shownTop]);

	// The marker under the pointer wins, then the country under it, then the nearest marker within `radius`
	const resolveCode = (target: EventTarget, clientX: number, clientY: number, radius: number) => {
		const stageRect = stageRef.current?.getBoundingClientRect();
		if (!stageRect) {
			return null;
		}
		const nearest = highlights.reduce<{ code: string | null; distance: number }>(
			(best, { code, x, y }) => {
				const distance = Math.hypot(
					stageRect.left + toLeft(x) * stageRect.width - clientX,
					stageRect.top + toTop(y) * stageRect.height - clientY,
				);

				return distance < best.distance ? { code, distance } : best;
			},
			{ code: null, distance: Infinity },
		);
		if (nearest.distance <= MARKER_RADIUS) {
			return nearest.code;
		}
		const shape = target instanceof Element ? target.closest('[data-code]') : null;

		return shape?.getAttribute('data-code') ?? (nearest.distance <= radius ? nearest.code : null);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType === 'touch') {
			return;
		}
		const code = isInPopup(event.target)
			? activeCode
			: resolveCode(event.target, event.clientX, event.clientY, HOVER_RADIUS);
		dispatch(code ? { type: 'show', code } : { type: 'leave' });
	};

	// Touch has no hover: the first tap on a country opens its popup, the second one follows its link
	const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
		const { pointerType, x, y } = pointerDownRef.current;
		// Browsers move the click of a tap towards the middle of a nearby link, which can be a neighbouring country:
		// the pointer event has the spot the finger touched
		const target = document.elementFromPoint(x, y);
		// Keyboard and scripted clicks have no detail and go straight to the link
		if (pointerType !== 'touch' || event.detail === 0 || !target || isInPopup(target)) {
			return;
		}
		event.preventDefault();
		const code = resolveCode(target, x, y, TAP_RADIUS);
		if (!code) {
			dispatch({ type: 'hide' });
		} else if (code !== activeCode) {
			dispatch({ type: 'show', code });
		} else if (highlights.some((highlight) => highlight.code === code && highlight.href)) {
			event.currentTarget.querySelector<HTMLAnchorElement>(`a[data-marker="${code}"]`)?.click();
		} else {
			dispatch({ type: 'hide' });
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Escape') {
			dispatch({ type: 'hide' });
		}
	};

	// Only keyboard focus opens the popup: a tap focuses its marker too, just before the click that opens the popup,
	// which would then take that first tap for the second one and follow the link
	const handleMarkerFocus = (event: FocusEvent<HTMLElement>, code: string) => {
		if (event.currentTarget.matches(':focus-visible')) {
			dispatch({ type: 'show', code });
		}
	};

	const popupContent = shown ? (
		<>
			<span className="relative size-9 shrink-0">
				{highlights.map(({ code }) => (
					<span
						key={code}
						className={cn(
							'absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none',
							code === shown.code ? 'opacity-100' : 'opacity-0',
						)}
					>
						<CountryFlag country={code} decorative />
					</span>
				))}
			</span>
			<span key={shown.code} className="animate-in fade-in flex min-w-0 flex-col duration-300 motion-reduce:animate-none">
				<span className="text-foreground text-base leading-tight font-bold text-balance">{shown.name}</span>
				{shown.detail ? <span className="text-muted-foreground text-xs leading-tight">{shown.detail}</span> : null}
			</span>
			{shown.href ? (
				<span
					className={cn(
						'text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full',
						brandGradientClassName,
					)}
				>
					<ArrowRight
						className="size-4 transition-transform duration-200 group-hover/card:translate-x-0.5 motion-reduce:transition-none"
						aria-hidden
					/>
				</span>
			) : null}
		</>
	) : null;

	return (
		<div
			ref={stageRef}
			role="group"
			aria-label={label}
			data-revealed={revealed}
			// The appearance and the highlight colour override some of the default colours, which `cn` resolves
			className={cn(stageVariants({ appearance, highlightColor }))}
			style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
			onPointerDown={(event) => {
				pointerDownRef.current = { pointerType: event.pointerType, x: event.clientX, y: event.clientY };
			}}
			onPointerMove={handlePointerMove}
			onPointerLeave={(event) => {
				if (event.pointerType !== 'touch') {
					dispatch({ type: 'leave' });
				}
			}}
			onClickCapture={handleClickCapture}
			onKeyDown={handleKeyDown}
		>
			{/* The map reveals itself once this band is in view: with 35% of the map in view, as long as the map fits the
			    viewport, and still in time when it is taller */}
			<span ref={revealRef} className="pointer-events-none absolute inset-x-0 top-[35%] bottom-[35%]" aria-hidden />
			<div className={cn('absolute inset-0', cropped && 'overflow-hidden rounded-3xl')}>
				{children}

				{/* Lets the pointer through to the land below, which has a hover state of its own */}
				<svg
					viewBox={viewBox}
					className={cn(
						'pointer-events-none absolute inset-0 size-full overflow-visible [&_[data-code]]:pointer-events-auto',
						// Lifts the light colours off light land
						highlightColor !== 'gradient' && 'drop-shadow-md drop-shadow-(color:--map-shadow)',
					)}
					aria-hidden
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" className="[stop-color:var(--map-highlight-from)]" />
							<stop offset="1" className="[stop-color:var(--map-highlight-to)]" />
						</linearGradient>
					</defs>
					<g className="stroke-background stroke-1 [fill-rule:evenodd] [stroke-linejoin:round]">
						{highlights.map((highlight, index) => {
							const path = (
								<path
									d={highlight.d}
									fill={`url(#${gradientId})`}
									className="origin-center scale-75 opacity-0 transition-[opacity,scale] duration-700 ease-out [fill-opacity:var(--map-highlight-opacity)] [vector-effect:non-scaling-stroke] transform-fill group-data-[revealed=true]/map:scale-100 group-data-[revealed=true]/map:opacity-100 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none [@media(scripting:none)]:scale-100 [@media(scripting:none)]:opacity-100"
									style={{ transitionDelay: `${index * REVEAL_STAGGER}ms` }}
								/>
							);

							return highlight.href ? (
								<Link
									key={highlight.code}
									href={highlight.href}
									tabIndex={-1}
									data-code={highlight.code}
									className="cursor-pointer outline-hidden"
								>
									{path}
								</Link>
							) : (
								<g key={highlight.code} data-code={highlight.code}>
									{path}
								</g>
							);
						})}
					</g>
				</svg>

				{overlay}

				{/* The lifted copy of the active country, above every other shape. A dilating stroke grows it by the same
				    amount whatever its size. */}
				<svg
					viewBox={viewBox}
					className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-lg"
					aria-hidden
				>
					{highlights.map((highlight) => (
						<g
							key={highlight.code}
							data-active={highlight.code === activeCode}
							className="group/lift opacity-0 transition-opacity duration-200 [fill-rule:evenodd] [stroke-linejoin:round] data-[active=true]:opacity-100 motion-reduce:transition-none [&>path]:transition-[stroke-width] [&>path]:duration-300 [&>path]:ease-out [&>path]:[vector-effect:non-scaling-stroke] motion-reduce:[&>path]:transition-none"
						>
							<path
								d={highlight.d}
								className="fill-background stroke-background stroke-0 group-data-[active=true]/lift:stroke-[9px]"
							/>
							<path
								d={highlight.d}
								className="fill-(--map-lift) stroke-(--map-lift) stroke-0 group-data-[active=true]/lift:stroke-[5px]"
							/>
						</g>
					))}
				</svg>
			</div>

			<ul role="list" className="pointer-events-none absolute inset-0">
				{highlights.map((highlight, index) => {
					const isActive = highlight.code === activeCode;
					// Screen readers get the detail with the name, as the popup that shows it is not announced
					const markerLabel = highlight.detail ? `${highlight.name}, ${highlight.detail}` : highlight.name;
					const markerClassName =
						'focus-visible:ring-primary focus-visible:ring-offset-background pointer-events-auto absolute flex size-6 -translate-1/2 items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2';
					const marker = (
						<span
							className="relative flex size-2.5 scale-0 items-center justify-center transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[revealed=true]/map:scale-100 motion-reduce:scale-100 motion-reduce:transition-none [@media(scripting:none)]:scale-100"
							style={{ transitionDelay: `${300 + index * REVEAL_STAGGER}ms` }}
							aria-hidden
						>
							{highlight.r < TINY_COUNTRY_RADIUS ? (
								<span className="absolute -inset-1.5 rounded-full bg-linear-to-br from-(--map-highlight-from) to-(--map-highlight-to)" />
							) : null}
							<span
								className={cn(
									'absolute inset-0 animate-ping rounded-full ring-2 ring-(--map-ring) [animation-duration:2.4s] motion-reduce:hidden',
									isActive && 'hidden',
								)}
								style={{ animationDelay: `${index * 400}ms` }}
							/>
							<span
								className={cn(
									// The faint outline keeps the white ring visible on light land
									'outline-primary/30 relative size-full rounded-full ring-2 ring-(--map-ring) outline-1 outline-offset-2 transition-[scale,background-color] duration-200 ease-out motion-reduce:transition-none',
									isActive && 'scale-125 bg-(--map-marker)',
								)}
							/>
						</span>
					);

					return (
						<li
							key={highlight.code}
							className="absolute"
							style={{ left: `${toLeft(highlight.x) * 100}%`, top: `${toTop(highlight.y) * 100}%` }}
						>
							{highlight.href ? (
								<Link
									href={highlight.href}
									aria-label={markerLabel}
									data-marker={highlight.code}
									className={markerClassName}
									onFocus={(event) => handleMarkerFocus(event, highlight.code)}
									onBlur={() => dispatch({ type: 'leave' })}
								>
									{marker}
								</Link>
							) : (
								<button
									type="button"
									aria-label={markerLabel}
									className={markerClassName}
									onFocus={(event) => handleMarkerFocus(event, highlight.code)}
									onBlur={() => dispatch({ type: 'leave' })}
								>
									{marker}
								</button>
							)}
						</li>
					);
				})}
			</ul>

			{shown ? (
				<div
					className={cn(
						'pointer-events-none absolute z-20',
						popup.gliding && 'transition-[left,top] duration-300 ease-out motion-reduce:transition-none',
					)}
					style={{ left: `${shownLeft * 100}%`, top: `${shownTop * 100}%` }}
				>
					<div
						ref={cardRef}
						data-popup
						data-open={popup.open}
						className={cn(
							'invisible absolute top-0 left-0 w-max max-w-[min(18rem,calc(100vw-1.5rem))] scale-90 opacity-0 duration-200 ease-out data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:scale-100 data-[open=true]:opacity-100 motion-reduce:transition-none',
							popup.gliding ? 'transition-[opacity,scale,visibility,translate]' : 'transition-[opacity,scale,visibility]',
						)}
					>
						{shown.href ? (
							<Link
								href={shown.href}
								tabIndex={-1}
								className="group/card bg-popover shadow-raised relative z-10 flex items-center gap-3 rounded-4xl p-1.5 pr-2"
							>
								{popupContent}
							</Link>
						) : (
							<div className="bg-popover shadow-raised relative z-10 flex items-center gap-3 rounded-4xl p-1.5 pr-5">
								{popupContent}
							</div>
						)}
						<span ref={arrowRef} className="bg-popover absolute left-1/2 size-3 rotate-45 rounded-xs" aria-hidden />
					</div>
				</div>
			) : null}
		</div>
	);
};
