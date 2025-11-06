'use client';

import { Button } from '@/app/portal/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { StepResultBox } from '@/app/portal/components/step-result-box';
import { generateSurveysAction, previewSurveyGenerationAction } from '@/app/portal/server-actions/survey-actions';
import { EyeIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';

type StepResult = string | object | string[] | null;

export function GenerateSurveysDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	const [results, setResults] = useState<Record<number, StepResult>>({});

	const iconClass = 'h-4 w-4';

	function setResult(step: number, value: StepResult) {
		setResults((prev) => ({ ...prev, [step]: value }));
	}

	const steps = [
		{
			id: 1,
			title: 'Preview generate surveys',
			label: 'Preview generate surveys (no changes)',
			description: 'Shows which surveys WOULD be created for recipients — nothing written yet.',
			icon: <EyeIcon className={iconClass} />,
			variant: 'outline' as const,
			action: async () => {
				const result = await previewSurveyGenerationAction();
				if (!result.success) {
					throw new Error(result.error);
				}
				return result.data;
			},
			filename: () => `preview-surveys.json`,
		},
		{
			id: 2,
			title: 'Generate surveys',
			label: 'Generate surveys (apply changes)',
			description: 'Actually creates surveys in the database for all eligible recipients.',
			icon: <PlayIcon className={iconClass} />,
			action: async () => {
				const result = await generateSurveysAction();
				if (!result.success) {
					throw new Error(result.error);
				}
				return result.data;
			},
			filename: () => `generated-surveys.json`,
		},
	];

	async function run(step: (typeof steps)[number]) {
		try {
			const result = await step.action();
			setResult(step.id, result);
		} catch (e) {
			setResult(step.id, e instanceof Error ? e.message : 'Unknown error');
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Survey generation process</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{steps.map((step) => (
						<div key={step.id} className="border-border bg-muted/40 flex flex-col gap-2 rounded-xl border p-3">
							<p className="font-medium">
								Step {step.id}: {step.title}
							</p>
							<p className="text-muted-foreground mb-1 text-xs">{step.description}</p>

							<Button
								className="flex w-full items-center justify-center gap-2"
								variant={step.variant ?? 'default'}
								onClick={() => run(step)}
							>
								{step.icon}
								{step.label}
							</Button>

							<StepResultBox
								value={results[step.id]}
								filename={step.filename()}
								onClear={() => setResult(step.id, null)}
							/>
						</div>
					))}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => setOpen(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
