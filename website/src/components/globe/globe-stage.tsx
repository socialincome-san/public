/**
 * Server-rendered globe stage.
 *
 * Reuses BaseService/ServiceResult for GeoJSON, `cn` + Tailwind for layout, and `logger` for failures.
 * The page, donation globe block, this stage, and the SVG fallback stay Server Components.
 * WebGL must stay client-side because globe.gl and three need `window`, a WebGL context, and ResizeObserver.
 * The browser loads `/assets/globe/countries-110m.json` through `getCountryGeoJson`; the SVG is generated at
 * build time from the same file and `INITIAL_GLOBE_VIEW` so both layers share orientation and the same square stage.
 * Reduced motion disables auto-rotation and the 500ms crossfade. Load or WebGL failures keep this fallback visible.
 * New dependencies: globe.gl and three (client WebGL), d3-geo (dev, fallback generation only).
 */
import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { GlobeClientShell } from './globe-client-shell';
import { GlobeFallback } from './globe-fallback';

type Props = {
	contributions: GlobeContribution[];
};

export const GlobeStage = ({ contributions }: Props) => (
	<div
		className="group/globe relative mx-auto aspect-square w-full max-w-[760px] overflow-visible"
		data-globe-stage
		data-ready="false"
		aria-hidden="true"
	>
		<div className="absolute inset-0 size-full -translate-y-[4%]">
			<div className="pointer-events-none absolute inset-0 size-full opacity-100 transition-opacity duration-500 group-data-[ready=true]/globe:opacity-0 motion-reduce:transition-none">
				<GlobeFallback />
			</div>
			<GlobeClientShell contributions={contributions} />
		</div>
	</div>
);
