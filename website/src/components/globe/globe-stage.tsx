import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { GlobeClientShell } from './globe-client-shell';
import { GlobeFallback } from './globe-fallback';

type Props = {
	contributions: GlobeContribution[];
	locale: string;
	label: string;
};

export const GlobeStage = ({ contributions, locale, label }: Props) => (
	<div
		className="group/globe relative mx-auto aspect-square w-full max-w-[760px] overflow-visible"
		data-globe-stage
		data-ready="false"
		role="img"
		aria-label={label}
	>
		<div className="absolute inset-0 size-full -translate-y-[4%]">
			<div className="pointer-events-none absolute inset-0 size-full opacity-100 transition-opacity duration-500 group-data-[ready=true]/globe:opacity-0 motion-reduce:transition-none">
				<GlobeFallback />
			</div>
			<GlobeClientShell contributions={contributions} locale={locale} />
		</div>
	</div>
);
