'use client';

import { Slider } from '@/components/slider';
import { IndirectImpactNotice } from './indirect-impact-notice';

type Props = {
	value: number;
	onChange: (value: number) => void;
};

export function RecipientsBox({ value, onChange }: Props) {
	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border">
			<div className="space-y-6 p-8">
				<h3 className="font-medium">Recipients for program start</h3>

				<div className="flex justify-center">
					<div className="rounded-lg border px-5 py-2 text-3xl">{value}</div>
				</div>

				<Slider min={10} max={1540} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />

				<div className="text-muted-foreground flex justify-between text-xs">
					<span>10</span>
					<span>1’540</span>
				</div>
			</div>

			<div className="mt-auto">
				<IndirectImpactNotice recipients={value} />
			</div>
		</div>
	);
}
