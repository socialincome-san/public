// Illustration colors without a matching theme token; default ring and dark dot stop equal --gradient-card-* and --primary.
// Dark surfaces declare `color-scheme: dark` (`scheme-dark`) and get the onDark colors, e.g. a light dot.
export const circleMarkColors = {
	default: {
		ring: ['#5792B7', '#CED3CA'],
		ringOnDark: ['#5792B7', '#CED3CA'],
		dot: ['#083344', '#0B728E'],
		dotOnDark: ['#F8FAFC', '#CED3CA'],
	},
	deep: {
		ring: ['#075783', '#9AB6AD'],
		// #075783 almost disappears on dark blue
		ringOnDark: ['#4D90A3', '#9AB6AD'],
		dot: ['#083344', '#075783'],
		dotOnDark: ['#F8FAFC', '#9AB6AD'],
	},
	cyanDeep: {
		ring: ['#07B6D5', '#0B728E'],
		ringOnDark: ['#07B6D5', '#0B728E'],
		dot: ['#075783', '#083344'],
		dotOnDark: ['#F8FAFC', '#07B6D5'],
	},
	seaGlass: {
		ring: ['#95B7AD', '#4D90A3'],
		ringOnDark: ['#95B7AD', '#4D90A3'],
		dot: ['#083344', '#075783'],
		dotOnDark: ['#F8FAFC', '#95B7AD'],
	},
} as const;

export type CircleMarkVariant = keyof typeof circleMarkColors;

type GradientProps = {
	id: string;
	variant: CircleMarkVariant;
};

// The attribute is the fallback for browsers without light-dark()
const AdaptiveStop = ({ offset, light, dark }: { offset: number; light: string; dark: string }) => (
	<stop offset={offset} stopColor={light} style={{ stopColor: `light-dark(${light}, ${dark})` }} />
);

export const RingGradient = ({ id, variant, animated }: GradientProps & { animated: boolean }) => {
	const { ring, ringOnDark } = circleMarkColors[variant];

	return (
		<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
			{animated && (
				<animateTransform
					attributeName="gradientTransform"
					type="rotate"
					values="0 .5 .5;360 .5 .5"
					dur="14s"
					repeatCount="indefinite"
				/>
			)}
			<AdaptiveStop offset={0} light={ring[0]} dark={ringOnDark[0]} />
			<AdaptiveStop offset={1} light={ring[1]} dark={ringOnDark[1]} />
		</linearGradient>
	);
};

export const DotGradient = ({ id, variant }: GradientProps) => {
	const { dot, dotOnDark } = circleMarkColors[variant];

	return (
		<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
			<AdaptiveStop offset={0} light={dot[0]} dark={dotOnDark[0]} />
			<AdaptiveStop offset={1} light={dot[1]} dark={dotOnDark[1]} />
		</linearGradient>
	);
};
