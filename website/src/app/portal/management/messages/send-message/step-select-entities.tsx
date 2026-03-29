'use client';

import { Label } from '@/components/label';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { MessageRecipientType } from '@/generated/prisma/enums';

const entityTypeOptions: { value: MessageRecipientType; label: string }[] = [
	{ value: MessageRecipientType.recipient, label: 'Recipients' },
	{ value: MessageRecipientType.contributor, label: 'Contributors' },
	{ value: MessageRecipientType.local_partner, label: 'Local Partners' },
	{ value: MessageRecipientType.user, label: 'Users' },
];

type StepSelectEntitiesProps = {
	recipientType: MessageRecipientType | null;
	onRecipientTypeChange: (type: MessageRecipientType) => void;
	recipientIds: string[];
	onRecipientIdsChange: (ids: string[]) => void;
};

export default function StepSelectEntities({
	recipientType,
	onRecipientTypeChange,
	recipientIds,
	onRecipientIdsChange,
}: StepSelectEntitiesProps) {
	return (
		<div className="space-y-4">
			<div>
				<Label className="mb-2 block text-sm font-medium">Entity Type</Label>
				<RadioGroup
					value={recipientType ?? undefined}
					onValueChange={(value) => {
						onRecipientTypeChange(value as MessageRecipientType);
						onRecipientIdsChange([]);
					}}
				>
					{entityTypeOptions.map((option) => (
						<div key={option.value} className="flex items-center space-x-2">
							<RadioGroupItem value={option.value} id={`entity-${option.value}`} />
							<Label htmlFor={`entity-${option.value}`}>{option.label}</Label>
						</div>
					))}
				</RadioGroup>
			</div>

			{recipientType && (
				<div>
					<Label className="mb-2 block text-sm font-medium">
						Selected: {recipientIds.length} {recipientType}(s)
					</Label>
					{/* TODO: Integrate entity selection table with checkboxes.
					    This would reuse the existing ConfiguredDataTableClient
					    with row selection enabled for the chosen entity type. */}
					<p className="text-muted-foreground text-sm">
						Entity selection table will be integrated here. For now, recipient IDs can be provided programmatically.
					</p>
				</div>
			)}
		</div>
	);
}
