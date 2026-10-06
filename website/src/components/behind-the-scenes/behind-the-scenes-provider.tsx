'use client';

import {
	CORNER_BOTTOM_CLASS,
	CORNER_TOP_CLASS,
	PANEL_SURFACE_CLASS,
} from '@/components/behind-the-scenes/behind-the-scenes.styles';
import { BehindTheScenesContext } from '@/components/behind-the-scenes/use-behind-the-scenes';
import { cn } from '@socialincome/design-system/cn';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
	children: ReactNode;
	/** Server-rendered panel content, revealed behind the page. */
	panel: ReactNode;
};

const APP_SHELL_SELECTOR = '[data-app-shell]';
/** How long the slab slides before the panel content starts arriving. */
const REVEAL_START_SECONDS = 0.33;

const noop = () => undefined;
const subscribeToNothing = () => noop;

/** False during SSR and hydration, true afterwards — document.body is only safe to portal into then. */
const useIsHydrated = () =>
	useSyncExternalStore(
		subscribeToNothing,
		() => true,
		() => false,
	);

/**
 * Slides the whole app shell aside to reveal the community panel underneath.
 *
 * The timeline follows the Osmo "fixed underlay navigation" resource: a single timeline split by
 * addPause() into an enter half and an exit half, with per-tween easeReverse so an interrupted
 * open reverses with a snappier curve than it played with. The four-branch toggle picks play /
 * reverse / restart from the playhead position so mid-animation interruptions don't snap.
 *
 * The panel is portalled to document.body on purpose: a transformed ancestor becomes the
 * containing block for position: fixed descendants, so a panel rendered inside the shell would
 * slide along with it instead of staying put.
 */
export const BehindTheScenesProvider = ({ children, panel }: Props) => {
	const panelId = useId();
	const isMounted = useIsHydrated();
	const [isOpen, setIsOpen] = useState(false);

	const panelRef = useRef<HTMLDivElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const darkRef = useRef<HTMLDivElement | null>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const enterEndTimeRef = useRef(0);
	const isOpenRef = useRef(false);

	useEffect(() => {
		if (!isMounted) {
			return;
		}

		const panelEl = panelRef.current;
		const overlayEl = overlayRef.current;
		const darkEl = darkRef.current;
		const shellEl = document.querySelector<HTMLElement>(APP_SHELL_SELECTOR);

		if (!panelEl || !overlayEl || !darkEl || !shellEl) {
			return;
		}

		gsap.registerPlugin(CustomEase);
		if (!CustomEase.get('glide')) {
			CustomEase.create('glide', 'M0,0 C0.32,0.72 0,1 1,1');
		}

		// One list, in DOM order, so the stagger reads as a sequence down the panel.
		const revealItems = panelEl.querySelectorAll('[data-reveal]');
		const corners = overlayEl.querySelectorAll('[data-bts-corner]');
		const shadowEl = overlayEl.querySelector('[data-bts-shadow]');
		const borderRows = overlayEl.querySelectorAll<HTMLElement>('[data-bts-border-row]');
		const getPanelOffset = () => -panelEl.offsetWidth;

		const context = gsap.context(() => {
			gsap.set(overlayEl, { visibility: 'hidden', pointerEvents: 'none' });
			gsap.set([darkEl, shadowEl], { autoAlpha: 0 });
			gsap.set(shellEl, { x: 0 });
			gsap.set(corners, { scale: 0 });
			gsap.set(borderRows[0], { yPercent: -100 });
			gsap.set(borderRows[1], { yPercent: 100 });

			const timeline = gsap.timeline({
				paused: true,
				defaults: { ease: 'glide', easeReverse: 'power2.inOut' },
			});

			timeline
				.set(overlayEl, { visibility: 'visible', pointerEvents: 'auto' }, 0)
				.to([shellEl, overlayEl], { x: getPanelOffset, duration: 0.65 }, 0)
				.to([darkEl, shadowEl], { autoAlpha: 1, duration: 0.52, ease: 'power2.out' }, 0)
				.to(corners, { scale: 1, duration: 0.48 }, 0)
				.to(borderRows, { yPercent: 0, duration: 0.48 }, 0)
				// Row by row rather than section by section: headings, entries and cards each enter on their
				// own beat, which reads as one continuous cascade instead of four blocks landing. A fixed px
				// offset rather than a percentage, so a tall card does not travel further than a short one.
				// Held back until the slab is most of the way across, so the page moves first.
				.fromTo(
					revealItems,
					{ autoAlpha: 0, x: 32 },
					{ autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' },
					REVEAL_START_SECONDS,
				);

			enterEndTimeRef.current = timeline.duration();
			timeline.addPause();

			timeline
				.to(revealItems, { autoAlpha: 0, duration: 0.25 }, '<')
				.to([shellEl, overlayEl], { x: 0, duration: 0.6 }, '<')
				.to([darkEl, shadowEl], { autoAlpha: 0, duration: 0.35, ease: 'power2.inOut' }, '<')
				.to(corners, { scale: 0, duration: 0.5 }, '<')
				.to(borderRows[0], { yPercent: -100, duration: 0.5 }, '<')
				.to(borderRows[1], { yPercent: 100, duration: 0.5 }, '<')
				.set(overlayEl, { visibility: 'hidden', pointerEvents: 'none' });

			timelineRef.current = timeline;
		});

		const handleResize = () => {
			if (isOpenRef.current) {
				gsap.set([shellEl, overlayEl], { x: getPanelOffset() });

				return;
			}

			timelineRef.current?.invalidate();
		};

		let resizeTimer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(handleResize, 150);
		};

		window.addEventListener('resize', onResize);

		return () => {
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', onResize);
			context.revert();
			timelineRef.current = null;
		};
	}, [isMounted]);

	const toggle = useCallback(() => {
		const timeline = timelineRef.current;
		if (!timeline) {
			return;
		}

		const nextIsOpen = !isOpenRef.current;
		isOpenRef.current = nextIsOpen;
		setIsOpen(nextIsOpen);
		document.body.dataset.behindTheScenes = nextIsOpen ? 'open' : '';

		// Freeze the page while the panel is open — only the panel itself scrolls. Deliberately no
		// scrollbar-width padding compensation: the overlay's corners are fixed and would not inherit
		// it, leaving a seam between the slab's edge and the panel. The reflow from the vanishing
		// scrollbar is hidden by the slide itself.
		// Applied to documentElement, not just body: html is the scrolling element here, so locking
		// body alone leaves the page scrollable.
		document.documentElement.style.overflow = nextIsOpen ? 'hidden' : '';
		document.body.style.overflow = nextIsOpen ? 'hidden' : '';

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const enterEndTime = enterEndTimeRef.current;

		if (prefersReducedMotion) {
			timeline.progress(nextIsOpen ? 0 : 1, true);
			timeline.seek(nextIsOpen ? enterEndTime : timeline.duration(), false);

			return;
		}

		if (nextIsOpen) {
			timeline.invalidate();
			if (timeline.time() >= enterEndTime) {
				timeline.timeScale(1).restart();
			} else {
				timeline.timeScale(1).play();
			}

			return;
		}

		if (timeline.time() < enterEndTime) {
			timeline.timeScale(1).reverse();

			return;
		}

		timeline.timeScale(1).play();
	}, []);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpenRef.current) {
				toggle();
			}
		};

		document.addEventListener('keydown', onKeyDown);

		return () => document.removeEventListener('keydown', onKeyDown);
	}, [toggle]);

	return (
		<BehindTheScenesContext.Provider value={{ isOpen, toggle, panelId }}>
			{children}

			{isMounted
				? createPortal(
						<>
							<div
								ref={panelRef}
								id={panelId}
								data-bts-panel
								aria-hidden={!isOpen}
								/*
								 * text-primary and antialiased because the portal puts this outside [data-app-shell],
								 * which is where both are set. Without them the panel renders browser-black text with
								 * subpixel smoothing, which makes the type look heavier than the rest of the site.
								 */
								className={cn(
									'text-primary fixed inset-y-0 right-0 z-0 w-[min(30rem,85vw)] overflow-y-auto overscroll-contain antialiased',
									PANEL_SURFACE_CLASS,
								)}
							>
								{panel}
							</div>
							<div
								ref={overlayRef}
								data-bts-overlay
								onClick={() => {
									if (isOpenRef.current) {
										toggle();
									}
								}}
								className="pointer-events-none invisible fixed inset-y-0 -right-px left-0 z-20 cursor-pointer"
							>
								<div ref={darkRef} data-bts-dark className="absolute inset-0 bg-black/30" />
								{/*
								 * The frame that gives the page slab its rounded corners. Bars slide in from the top and
								 * bottom edges; each radial-gradient square fills the outside of a corner arc, so the slab
								 * reads as an inset card. It rides the same translate as the slab, which keeps the corners
								 * glued to the slab's right edge.
								 */}
								<div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
									<div data-bts-border-row className="flex flex-col items-end">
										<div className={cn('h-6 w-full', PANEL_SURFACE_CLASS)} />
										<div data-bts-corner className={cn('size-8 origin-top-right', CORNER_TOP_CLASS)} />
									</div>
									<div data-bts-border-row className="flex flex-col items-end">
										<div data-bts-corner className={cn('size-8 origin-bottom-right', CORNER_BOTTOM_CLASS)} />
										<div className={cn('h-6 w-full', PANEL_SURFACE_CLASS)} />
									</div>
								</div>
								{/*
								 * Casts the slab's drop shadow. It traces the visible card area exactly — inset by the bar
								 * height, radius matching the corner gradients — and paints nothing itself: an outer
								 * box-shadow is clipped to outside the border box, so it falls on the frame and the panel
								 * without darkening the page underneath. Sits after the frame so it lands on top of it.
								 */}
								<div
									data-bts-shadow
									className="shadow-backstage pointer-events-none absolute inset-y-6 right-0 left-0 rounded-4xl"
								/>
							</div>
						</>,
						document.body,
					)
				: null}
		</BehindTheScenesContext.Provider>
	);
};
