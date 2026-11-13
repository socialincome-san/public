import NextImage from 'next/image';
import { useId } from 'react';
import { cn } from '../../../cn';
import {
	AFRICA_MAP_FRAME,
	AFRICA_MAP_OUTLINE,
	AFRICA_MAP_SHAPES,
	AFRICA_MAP_ZOOM,
	type AfricaMapFrame,
	type AfricaMapRegion,
	type AfricaMapShape,
} from './africa-map-geometry';
import { type AfricaMapAppearance, type AfricaMapHighlightColor, AfricaMapStage } from './africa-map-stage';

type AfricaMapCountry = {
	// ISO 3166-1 alpha-2 code of an African country
	code: string;
	name: string;
	// Page the country and its popup link to
	href?: string;
	// Shown below the name in the popup, such as a number of people
	detail?: string;
};

type AfricaMapProps = {
	// Accessible name of the map
	label: string;
	// Countries to highlight; codes that are not on the map are skipped
	countries: AfricaMapCountry[];
	// Colour of the land. `satellite` shows a satellite image instead, on which a border only appears while its
	// country is hovered.
	appearance?: AfricaMapAppearance;
	// Colour of the highlighted countries
	highlightColor?: AfricaMapHighlightColor;
	// Clouds drifting over the satellite image
	clouds?: boolean;
	// Region whose countries get a slight tint
	shadedRegion?: AfricaMapRegion | 'subSaharan';
	// Region to zoom in on, instead of showing the whole continent
	zoom?: AfricaMapRegion;
};

// Room for the neighbouring islands and the marker of an island state outside the frame
const OUTLIER_MARGIN = 48;
// A country with its marker this close to the edge of a zoomed map lies mostly beyond it
const ZOOM_INSET = 0.04;

// NASA Blue Marble (public domain), in the projection of the shapes and graded with the brand colours
const SATELLITE_SRC = '/assets/africa-map/satellite.webp';
// NASA Blue Marble cloud cover (public domain), a tile that repeats seamlessly sideways
const CLOUDS_SRC = '/assets/africa-map/clouds.webp';
const CLOUDS_SIZE = { width: 1600, height: 640 };
// As over Africa, the trade winds carry the clouds west across the tropics and the westerlies carry them east in the far
// north and south. Where the bands overlap, clouds seem to dissolve and form.
const CLOUD_BANDS = [
	{
		mask: 'mask-[linear-gradient(transparent_14%,#000_30%_70%,transparent_86%)]',
		motion: 'animate-[marquee-left_528s_linear_infinite,sway-y_110s_ease-in-out_infinite_alternate]',
	},
	{
		mask: 'mask-[linear-gradient(#000_14%,transparent_30%_70%,#000_86%)]',
		motion: 'animate-[marquee-right_792s_linear_infinite,sway-y_140s_ease-in-out_infinite_alternate-reverse]',
	},
];

const isOutlier = ({ x }: AfricaMapShape) => x < AFRICA_MAP_FRAME.x || x > AFRICA_MAP_FRAME.x + AFRICA_MAP_FRAME.width;

const isInside = ({ x, y }: AfricaMapShape, frame: AfricaMapFrame, inset = 0) =>
	x >= frame.x + frame.width * inset &&
	x <= frame.x + frame.width * (1 - inset) &&
	y >= frame.y + frame.height * inset &&
	y <= frame.y + frame.height * (1 - inset);

// The frame grows sideways to take in highlighted island states that lie outside of it
const getFrame = (highlights: AfricaMapShape[], zoom?: AfricaMapRegion): AfricaMapFrame => {
	const frame = zoom ? AFRICA_MAP_ZOOM[zoom] : AFRICA_MAP_FRAME;
	const outliers = highlights.filter((shape) => isOutlier(shape) && (!zoom || shape.region === zoom)).map(({ x }) => x);
	const left = Math.min(frame.x, ...outliers.map((x) => x - OUTLIER_MARGIN));
	const right = Math.max(frame.x + frame.width, ...outliers.map((x) => x + OUTLIER_MARGIN));

	return { ...frame, x: left, width: right - left };
};

const landClassName = [
	'[fill-rule:evenodd] [stroke-linejoin:round] stroke-1',
	'[&>path]:fill-(--map-land) [&>path]:stroke-(--map-line) [&>path]:[vector-effect:non-scaling-stroke]',
	'[&>path]:transition-[fill,stroke] [&>path]:duration-200 motion-reduce:[&>path]:transition-none',
	'[&>path[data-shaded]]:fill-[color-mix(in_srgb,var(--map-tint)_var(--map-shade),var(--map-land))]',
	// Touch screens keep :hover on the last tapped element
	'[@media(hover:hover)]:[&>path:hover]:fill-[color-mix(in_srgb,var(--map-tint)_var(--map-hover),var(--map-land))]',
	'[@media(hover:hover)]:[&>path:hover]:stroke-(--map-line-hover)',
	'[@media(hover:hover)]:[&>path[data-shaded]:hover]:fill-[color-mix(in_srgb,var(--map-tint)_calc(var(--map-shade)_+_var(--map-hover)),var(--map-land))]',
].join(' ');

export const AfricaMap = ({
	label,
	countries,
	appearance = 'light',
	highlightColor = 'gradient',
	clouds = false,
	shadedRegion,
	zoom,
}: AfricaMapProps) => {
	const clipId = useId();
	const cloudShadowId = useId();
	const selected = AFRICA_MAP_SHAPES.flatMap((shape) => {
		const country = countries.find(({ code }) => code.toLowerCase() === shape.code);

		return country ? [{ ...shape, name: country.name, href: country.href, detail: country.detail }] : [];
	});
	const frame = getFrame(selected, zoom);
	// West to east, which is the order of the reveal and of the tab stops
	const highlights = selected.filter((shape) => isInside(shape, frame, zoom ? ZOOM_INSET : 0)).sort((a, b) => a.x - b.x);
	const scale = AFRICA_MAP_FRAME.width / frame.width;
	const viewBox = `${frame.x} ${frame.y} ${frame.width} ${frame.height}`;
	// Where the unzoomed frame, which the satellite image fills, lies in the frame that is shown
	const imageBox = {
		left: `${((AFRICA_MAP_FRAME.x - frame.x) / frame.width) * 100}%`,
		top: `${((AFRICA_MAP_FRAME.y - frame.y) / frame.height) * 100}%`,
		width: `${scale * 100}%`,
		height: `${(AFRICA_MAP_FRAME.height / frame.height) * 100}%`,
	};
	const isSatellite = appearance === 'satellite';
	const cloudTiles = [0, 1].map((tile) => (
		<NextImage
			key={tile}
			src={CLOUDS_SRC}
			alt=""
			width={CLOUDS_SIZE.width}
			height={CLOUDS_SIZE.height}
			sizes={`${Math.round(scale * 1800)}px`}
			className="h-full w-auto max-w-none"
		/>
	));

	return (
		<AfricaMapStage
			label={label}
			appearance={appearance}
			highlightColor={highlightColor}
			frame={frame}
			cropped={zoom !== undefined}
			highlights={highlights}
			overlay={
				isSatellite && clouds ? (
					<div className="pointer-events-none absolute" style={imageBox} aria-hidden>
						<div className="size-full overflow-hidden" style={{ clipPath: `url(#${clipId})` }}>
							{CLOUD_BANDS.map(({ mask, motion }) => (
								<div key={mask} className={cn('absolute inset-0', mask)}>
									{/* Taller than the map, so that its edges stay out of sight while it sways */}
									<div className={cn('absolute -top-[5%] h-[110%] w-max motion-reduce:animate-none', motion)}>
										{/* The shadow the clouds cast on the land: the same tiles, a little to the lower right */}
										<div
											className="absolute inset-0 flex translate-x-[0.5%] translate-y-[2.4%] opacity-60"
											style={{ filter: `url(#${cloudShadowId})` }}
										>
											{cloudTiles}
										</div>
										<div className="flex h-full opacity-80">{cloudTiles}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				) : undefined
			}
		>
			{isSatellite ? (
				<>
					<svg width="0" height="0" className="absolute" aria-hidden>
						<clipPath id={clipId} clipPathUnits="objectBoundingBox">
							<path
								d={AFRICA_MAP_OUTLINE}
								transform={`scale(${1 / AFRICA_MAP_FRAME.width} ${1 / AFRICA_MAP_FRAME.height})`}
							/>
						</clipPath>
						{/* Turns the clouds into their shadow: only the denser parts cast one, soft and in the dark brand colour */}
						<filter id={cloudShadowId} colorInterpolationFilters="sRGB">
							<feComponentTransfer in="SourceAlpha">
								<feFuncA type="linear" slope="1.6" intercept="-0.25" />
							</feComponentTransfer>
							<feGaussianBlur stdDeviation="3" result="shape" />
							<feFlood className="[flood-color:hsl(var(--primary))]" />
							<feComposite in2="shape" operator="in" />
						</filter>
					</svg>
					<div className="drop-shadow-card absolute drop-shadow-(color:--map-shadow)" style={imageBox} aria-hidden>
						<div className="relative size-full" style={{ clipPath: `url(#${clipId})` }}>
							<NextImage
								src={SATELLITE_SRC}
								alt=""
								fill
								sizes={`(min-width: 1024px) ${Math.round(scale * 50)}vw, ${Math.round(scale * 100)}vw`}
							/>
						</div>
					</div>
				</>
			) : null}
			<svg
				viewBox={viewBox}
				className={
					isSatellite
						? 'absolute inset-0 size-full overflow-visible'
						: 'drop-shadow-card absolute inset-0 size-full overflow-visible drop-shadow-(color:--map-shadow)'
				}
				aria-hidden
			>
				<g className={landClassName}>
					{AFRICA_MAP_SHAPES.filter((shape) => !isOutlier(shape) || isInside(shape, frame)).map((shape) => (
						<path
							key={shape.code}
							d={shape.d}
							data-shaded={
								shape.region === shadedRegion || (shadedRegion === 'subSaharan' && shape.region !== 'northern')
									? ''
									: undefined
							}
						/>
					))}
				</g>
			</svg>
		</AfricaMapStage>
	);
};
