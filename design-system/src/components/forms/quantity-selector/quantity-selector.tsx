'use client';

import { useState } from 'react';
import { Input } from '../input/input';
import { Slider } from '../slider/slider';

type QuantitySelectorProps = {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
	atMaxHint?: string;
	emptyMessage?: string;
	name?: string;
	inputTestId?: string;
	sliderTestId?: string;
	disabled?: boolean;
};

const parseQuantityInput = (raw: string, min: number, max: number): number | null => {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return null;
	}

	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return Math.min(max, Math.max(min, Math.round(parsed)));
};

export const QuantitySelector = ({
	label,
	value,
	min,
	max,
	onChange,
	atMaxHint,
	emptyMessage,
	name,
	inputTestId,
	sliderTestId,
	disabled = false,
}: QuantitySelectorProps) => {
	const [draft, setDraft] = useState<string | null>(null);
	const unavailable = max < min;
	const atMax = !unavailable && value === max;
	const inputValue = unavailable ? '0' : (draft ?? String(value));

	const commitQuantity = (raw: string) => {
		setDraft(null);
		const parsed = parseQuantityInput(raw, min, max);
		if (parsed !== null && parsed !== value) {
			onChange(parsed);
		}
	};

	return (
		<div className="space-y-6">
			<p className="font-medium">{label}</p>

			<div className="flex justify-center">
				<div className="border-input focus-within:border-ring focus-within:ring-ring/50 w-32 rounded-lg border px-5 py-2 text-center text-3xl tabular-nums focus-within:ring-[3px]">
					<Input
						variant="bare"
						type="number"
						inputMode="numeric"
						name={name}
						autoComplete="off"
						min={min}
						max={unavailable ? 0 : max}
						disabled={disabled || unavailable}
						value={inputValue}
						onChange={(event) => setDraft(event.target.value)}
						onBlur={(event) => commitQuantity(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.currentTarget.blur();
							}
						}}
						aria-label={label}
						data-testid={inputTestId}
					/>
				</div>
			</div>

			{unavailable ? (
				emptyMessage ? (
					<div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{emptyMessage}</div>
				) : null
			) : (
				<>
					<Slider
						data-testid={sliderTestId}
						min={min}
						max={max}
						step={1}
						disabled={disabled}
						value={[value]}
						onValueChange={([nextValue]) => {
							setDraft(null);
							if (nextValue !== undefined) {
								onChange(nextValue);
							}
						}}
						aria-label={label}
					/>

					<div className="text-muted-foreground flex justify-between text-xs">
						<span>{min}</span>
						<span>{max}</span>
					</div>

					{atMax && atMaxHint ? <p className="text-muted-foreground text-center text-xs">{atMaxHint}</p> : null}
				</>
			)}
		</div>
	);
};
