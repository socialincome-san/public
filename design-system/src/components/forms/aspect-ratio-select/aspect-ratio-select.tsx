'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/select';

type AspectRatioSelectProps = {
	items: { value: string; label: string; width: number; height: number }[];
	label: string;
	name?: string;
	value: string;
	onValueChange: (value: string) => void;
	disabled?: boolean;
};

export const AspectRatioSelect = ({ items, label, name, value, onValueChange, disabled }: AspectRatioSelectProps) => (
	<Select name={name} value={value} onValueChange={onValueChange} disabled={disabled}>
		<SelectTrigger aria-label={label}>
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			{items.map((item) => (
				<SelectItem key={item.value} value={item.value} textValue={`${item.value} ${item.label}`}>
					<span className="flex items-center gap-2">
						<span aria-hidden="true" className="text-primary flex size-4 shrink-0 items-center justify-center">
							<span
								className="bg-primary/10 rounded-xs border border-current"
								style={{
									width: `${(item.width / Math.max(item.width, item.height)) * 100}%`,
									height: `${(item.height / Math.max(item.width, item.height)) * 100}%`,
								}}
							/>
						</span>
						<span className="font-medium tabular-nums">{item.value}</span>
						<span className="text-muted-foreground">{item.label}</span>
					</span>
				</SelectItem>
			))}
		</SelectContent>
	</Select>
);
