import { useEffect, useMemo, useRef } from 'react';

// All lengths are in viewBox units (the visual is 200 × 200) and all times in seconds
export const CIRCLE_CONFIG = {
	center: 100,
	ringRadius: 60,
	ringStroke: { regular: 12, compact: 16 },
	dotRadius: { regular: 8.5, compact: 10 },
	// Above this many active members the dots shrink so they still fit inside the ring
	comfortableDotCount: 12,
	// Contacts are checked pair by pair, so very large circles draw only this many members (the count label stays exact)
	maxDotCount: 40,
	// Free space between a dot's edge and the ring's inner edge; keeps centres within 38 at the regular size
	wallGap: 7.5,
	// Free space kept between two dots; a centre distance of 20.5 at the regular size
	dotGap: 3.5,
	// Radius of the spread-out still arrangement, also where the motion starts
	startRadius: 36,

	orbit: { radius: 84, stroke: 2.5, dash: '0.1 7', secondsPerTurn: 90 },
	// Share of its stretch of the orbit an interested member may cover; with many of them they shrink instead of touching
	orbitDotShare: 0.6,

	// Wandering: speed in units per second, heading noise in radians per √second
	speed: 6,
	headingNoise: 0.9,
	// How fast a dot's speed returns to `speed` after a bump, per second
	speedRelax: 1.5,

	// Conversations: one member speaks, the others gather around and listen
	episodeInterval: [8, 12],
	firstEpisodeDelay: [1.5, 9],
	episodeSeconds: 5.5,
	speakerMaxOffset: 12,
	speakerSpring: { stiffness: 1.2, damping: 2.5 },
	listenerDistance: 22,
	crowdedListenerDistance: 23,
	crowdedCount: 6,
	listenerSpring: { stiffness: 1.1, damping: 2 },
	// Random nudges while listening, in units per second per √second
	listenerJitter: 1.2,
	pulse: { seconds: 1.8, growBy: 11, opacity: 0.6, stroke: 1.5 },

	// Fixed physics step, so motion is the same at 60 Hz and 120 Hz
	step: 1 / 60,
	// A longer gap (e.g. a stalled tab) is cut short instead of fast-forwarding
	maxFrameSeconds: 0.25,

	colors: {
		orbit: '#CED3CA',
		pulse: '#5792B7',
		interested: ['#FBEDD1', '#CADDE9'],
	},
} as const;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const LAYOUT_RELAX_ITERATIONS = 80;

type Point = { x: number; y: number };
type Dot = Point & { vx: number; vy: number };
type Random = () => number;

export type CircleLayout = {
	dotRadius: number;
	ringStroke: number;
	// Furthest a dot's centre may be from the middle
	wall: number;
	minDistance: number;
	listenerDistance: number;
	positions: (Point & { id: string })[];
};

// FNV-1a, so every card gets its own but stable seed from a string
const hashSeed = (text: string) => {
	let hash = 2166136261;
	for (let index = 0; index < text.length; index++) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
};

// mulberry32: small seeded generator, so server and client compute the same layout
const createRandom = (seed: number): Random => {
	let state = seed;

	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
};

const gaussian = (random: Random) => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());

const between = (random: Random, [min, max]: readonly [number, number]) => min + random() * (max - min);

const keepInside = (dot: Dot, wall: number) => {
	const distance = Math.hypot(dot.x, dot.y);
	if (distance <= wall) {
		return;
	}

	const nx = dot.x / distance;
	const ny = dot.y / distance;
	dot.x = nx * wall;
	dot.y = ny * wall;
	const outward = dot.vx * nx + dot.vy * ny;
	if (outward > 0) {
		dot.vx -= 2 * outward * nx;
		dot.vy -= 2 * outward * ny;
	}
};

// Pushes overlapping dots apart equally; approaching dots swap their speed along the line between them (equal-mass bounce)
const separate = (first: Dot, second: Dot, minDistance: number) => {
	const dx = second.x - first.x;
	const dy = second.y - first.y;
	const distance = Math.hypot(dx, dy);
	if (distance >= minDistance) {
		return;
	}

	// Dots on the exact same spot get pushed apart sideways
	const nx = distance === 0 ? 1 : dx / distance;
	const ny = distance === 0 ? 0 : dy / distance;
	const push = (minDistance - distance) / 2;
	first.x -= nx * push;
	first.y -= ny * push;
	second.x += nx * push;
	second.y += ny * push;
	const approach = (first.vx - second.vx) * nx + (first.vy - second.vy) * ny;
	if (approach > 0) {
		first.vx -= approach * nx;
		first.vy -= approach * ny;
		second.vx += approach * nx;
		second.vy += approach * ny;
	}
};

const resolveContacts = (dots: Dot[], minDistance: number, wall: number) => {
	for (let i = 0; i < dots.length; i++) {
		for (let j = i + 1; j < dots.length; j++) {
			separate(dots[i], dots[j], minDistance);
		}
	}
	for (const dot of dots) {
		keepInside(dot, wall);
	}
};

// An evenly spread, non-overlapping arrangement turned by a per-card angle: the still state and where motion starts
const getCircleLayout = (activeCount: number, seed: string, compact: boolean): CircleLayout => {
	const config = CIRCLE_CONFIG;
	const count = Math.min(activeCount, config.maxDotCount);
	const scale = Math.min(1, Math.sqrt(config.comfortableDotCount / Math.max(count, 1)));
	const dotRadius = (compact ? config.dotRadius.compact : config.dotRadius.regular) * scale;
	const ringStroke = compact ? config.ringStroke.compact : config.ringStroke.regular;
	const wall = config.ringRadius - ringStroke / 2 - dotRadius - config.wallGap * scale;
	const minDistance = 2 * dotRadius + config.dotGap * scale;
	const preferredListenerDistance =
		(count >= config.crowdedCount ? config.crowdedListenerDistance : config.listenerDistance) * scale;
	const layout = {
		dotRadius,
		ringStroke,
		wall,
		minDistance,
		listenerDistance: Math.max(preferredListenerDistance, minDistance + 1),
	};

	const rotation = createRandom(hashSeed(seed))() * 2 * Math.PI;
	const spread = Math.min(config.startRadius, wall);
	const dots: Dot[] = Array.from({ length: count }, (_, index) => {
		const distance = count === 1 ? 0 : spread * Math.sqrt((index + 0.5) / count);
		const angle = rotation + index * GOLDEN_ANGLE;

		return { x: distance * Math.cos(angle), y: distance * Math.sin(angle), vx: 0, vy: 0 };
	});
	for (let iteration = 0; iteration < LAYOUT_RELAX_ITERATIONS; iteration++) {
		resolveContacts(dots, minDistance, wall);
	}

	return { ...layout, positions: dots.map(({ x, y }, index) => ({ id: `member-${index}`, x, y })) };
};

// Spring toward a target: acceleration = stiffness × distance − damping × velocity
const springToward = (dot: Dot, target: Point, spring: { stiffness: number; damping: number }, dt: number) => {
	dot.vx += (spring.stiffness * (target.x - dot.x) - spring.damping * dot.vx) * dt;
	dot.vy += (spring.stiffness * (target.y - dot.y) - spring.damping * dot.vy) * dt;
};

const setHeading = (dot: Dot, angle: number, speed: number) => {
	dot.vx = speed * Math.cos(angle);
	dot.vy = speed * Math.sin(angle);
};

const wander = (dot: Dot, random: Random, dt: number) => {
	const speed = Math.hypot(dot.vx, dot.vy);
	if (speed < 1e-6) {
		setHeading(dot, random() * 2 * Math.PI, CIRCLE_CONFIG.speed);

		return;
	}

	const angle = Math.atan2(dot.vy, dot.vx) + gaussian(random) * CIRCLE_CONFIG.headingNoise * Math.sqrt(dt);
	const relaxedSpeed = speed + (CIRCLE_CONFIG.speed - speed) * Math.min(1, CIRCLE_CONFIG.speedRelax * dt);
	setHeading(dot, angle, relaxedSpeed);
};

type Episode = { speaker: number; target: Point; startsAt: number; endsAt: number };

const createSimulation = (layout: CircleLayout, random: Random) => {
	const config = CIRCLE_CONFIG;
	const dots: Dot[] = layout.positions.map(({ x, y }) => {
		const dot = { x, y, vx: 0, vy: 0 };
		setHeading(dot, random() * 2 * Math.PI, config.speed);

		return dot;
	});
	let time = 0;
	let nextEpisodeAt = between(random, config.firstEpisodeDelay);
	let episode: Episode | null = null;
	let lastSpeaker = -1;

	const startEpisode = () => {
		// Never the same speaker twice in a row
		const choice = Math.floor(random() * (dots.length - 1));
		const speaker = lastSpeaker === -1 ? Math.floor(random() * dots.length) : (lastSpeaker + 1 + choice) % dots.length;
		const offset = config.speakerMaxOffset * Math.sqrt(random());
		const angle = random() * 2 * Math.PI;
		lastSpeaker = speaker;
		episode = {
			speaker,
			target: { x: offset * Math.cos(angle), y: offset * Math.sin(angle) },
			startsAt: time,
			endsAt: time + config.episodeSeconds,
		};
	};

	const endEpisode = () => {
		episode = null;
		nextEpisodeAt = time + between(random, config.episodeInterval);
		for (const dot of dots) {
			setHeading(dot, random() * 2 * Math.PI, config.speed);
		}
	};

	const step = (dt: number) => {
		time += dt;
		if (!episode && dots.length > 1 && time >= nextEpisodeAt) {
			startEpisode();
		} else if (episode && time >= episode.endsAt) {
			endEpisode();
		}

		dots.forEach((dot, index) => {
			if (!episode) {
				wander(dot, random, dt);

				return;
			}
			if (index === episode.speaker) {
				springToward(dot, episode.target, config.speakerSpring, dt);

				return;
			}

			const speaker = dots[episode.speaker];
			const dx = dot.x - speaker.x;
			const dy = dot.y - speaker.y;
			const distance = Math.hypot(dx, dy);
			const angle = distance === 0 ? random() * 2 * Math.PI : Math.atan2(dy, dx);
			const target = {
				x: speaker.x + layout.listenerDistance * Math.cos(angle),
				y: speaker.y + layout.listenerDistance * Math.sin(angle),
			};
			springToward(dot, target, config.listenerSpring, dt);
			dot.vx += gaussian(random) * config.listenerJitter * Math.sqrt(dt);
			dot.vy += gaussian(random) * config.listenerJitter * Math.sqrt(dt);
		});

		for (const dot of dots) {
			dot.x += dot.vx * dt;
			dot.y += dot.vy * dt;
		}
		resolveContacts(dots, layout.minDistance, layout.wall);
	};

	// The radiating ring around the speaker, or null between conversations
	const getPulse = () => {
		if (!episode) {
			return null;
		}

		const progress = ((time - episode.startsAt) % config.pulse.seconds) / config.pulse.seconds;

		return {
			...dots[episode.speaker],
			radius: layout.dotRadius + config.pulse.growBy * progress,
			opacity: config.pulse.opacity * (1 - progress),
		};
	};

	return { dots, step, getPulse };
};

type CircleSimulationOptions = {
	activeCount: number;
	// Gives each card its own arrangement and timing, e.g. its link
	seed: string;
	compact: boolean;
	animated: boolean;
};

/**
 * Moves the active members inside the ring: they wander and bump into each other, and every 8–12 s one of them
 * speaks while the others gather around. Positions are written straight to the SVG, so nothing re-renders per frame.
 * Pauses while the visual is off screen or the tab is hidden.
 */
export const useCircleSimulation = ({ activeCount, seed, compact, animated }: CircleSimulationOptions) => {
	const layout = useMemo(() => getCircleLayout(activeCount, seed, compact), [activeCount, seed, compact]);
	const svgRef = useRef<SVGSVGElement>(null);
	const pulseRef = useRef<SVGCircleElement>(null);
	const dotElementsRef = useRef<(SVGCircleElement | null)[]>([]);

	useEffect(() => {
		const svg = svgRef.current;
		const pulseElement = pulseRef.current;
		const dotElements = dotElementsRef.current;
		const config = CIRCLE_CONFIG;
		const writePositions = (positions: Point[]) => {
			positions.forEach(({ x, y }, index) => {
				dotElements[index]?.setAttribute('cx', (config.center + x).toFixed(2));
				dotElements[index]?.setAttribute('cy', (config.center + y).toFixed(2));
			});
		};
		// The previous run's cleanup writes its own, older layout over what React just rendered
		writePositions(layout.positions);
		if (!animated || activeCount === 0 || !svg) {
			return;
		}

		const simulation = createSimulation(layout, createRandom(hashSeed(`${seed}:motion`)));
		const writePulse = () => {
			const pulse = simulation.getPulse();
			pulseElement?.setAttribute('opacity', pulse ? pulse.opacity.toFixed(3) : '0');
			if (pulse) {
				pulseElement?.setAttribute('cx', (config.center + pulse.x).toFixed(2));
				pulseElement?.setAttribute('cy', (config.center + pulse.y).toFixed(2));
				pulseElement?.setAttribute('r', pulse.radius.toFixed(2));
			}
		};

		let frame = 0;
		let running = false;
		let onScreen = false;
		let previousTime: number | null = null;
		let pending = 0;

		const tick = (now: number) => {
			if (previousTime !== null) {
				pending += Math.min((now - previousTime) / 1000, config.maxFrameSeconds);
			}
			previousTime = now;
			while (pending >= config.step) {
				simulation.step(config.step);
				pending -= config.step;
			}
			writePositions(simulation.dots);
			writePulse();
			frame = requestAnimationFrame(tick);
		};

		const update = () => {
			const shouldRun = onScreen && !document.hidden;
			if (shouldRun && !running) {
				running = true;
				previousTime = null;
				frame = requestAnimationFrame(tick);
			} else if (!shouldRun && running) {
				running = false;
				cancelAnimationFrame(frame);
			}
		};

		const observer = new IntersectionObserver((entries) => {
			onScreen = entries.some((entry) => entry.isIntersecting);
			update();
		});
		observer.observe(svg);
		document.addEventListener('visibilitychange', update);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			document.removeEventListener('visibilitychange', update);
			// Back to the still arrangement, e.g. when reduced motion gets turned on
			writePositions(layout.positions);
			pulseElement?.setAttribute('opacity', '0');
		};
	}, [animated, activeCount, layout, seed]);

	const setDotRef = (index: number) => (element: SVGCircleElement | null) => {
		dotElementsRef.current[index] = element;
	};

	return { layout, svgRef, pulseRef, setDotRef };
};
