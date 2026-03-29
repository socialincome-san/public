'use client';

import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { MessageChannel } from '@/generated/prisma/enums';
import { getActiveTemplatesByChannelAction } from '@/lib/server-actions/messaging-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { MessageTemplateOption } from '@/lib/services/messaging/message-template.types';
import { useEffect, useState, useTransition } from 'react';

type ContentMode = 'template' | 'freetext';

type StepComposeContentProps = {
	channel: MessageChannel;
	templateId: string | undefined;
	onTemplateIdChange: (id: string | undefined) => void;
	freeTextBody: string;
	onFreeTextBodyChange: (body: string) => void;
	freeTextSubject: string;
	onFreeTextSubjectChange: (subject: string) => void;
};

export default function StepComposeContent({
	channel,
	templateId,
	onTemplateIdChange,
	freeTextBody,
	onFreeTextBodyChange,
	freeTextSubject,
	onFreeTextSubjectChange,
}: StepComposeContentProps) {
	const [mode, setMode] = useState<ContentMode>(templateId ? 'template' : 'freetext');
	const [templates, setTemplates] = useState<MessageTemplateOption[]>([]);
	const [isLoading, startTransition] = useTransition();
	const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<string | null>(null);

	useEffect(() => {
		startTransition(async () => {
			const result = await getActiveTemplatesByChannelAction(channel);
			handleServiceResult(result, {
				onSuccess: (data) => setTemplates(data),
				onError: () => setTemplates([]),
			});
		});
	}, [channel]);

	const handleModeChange = (newMode: string) => {
		setMode(newMode as ContentMode);
		if (newMode === 'freetext') {
			onTemplateIdChange(undefined);
			setSelectedTemplatePreview(null);
		} else {
			onFreeTextBodyChange('');
			onFreeTextSubjectChange('');
		}
	};

	const handleTemplateSelect = (id: string) => {
		onTemplateIdChange(id);
		const template = templates.find((t) => t.id === id);
		setSelectedTemplatePreview(template?.body ?? null);
	};

	return (
		<div className="space-y-4">
			<RadioGroup value={mode} onValueChange={handleModeChange}>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="template" id="mode-template" />
					<Label htmlFor="mode-template">Use Template</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="freetext" id="mode-freetext" />
					<Label htmlFor="mode-freetext">Free Text</Label>
				</div>
			</RadioGroup>

			{mode === 'template' && (
				<div className="space-y-3">
					<Select value={templateId ?? ''} onValueChange={handleTemplateSelect} disabled={isLoading}>
						<SelectTrigger>
							<SelectValue placeholder={isLoading ? 'Loading templates...' : 'Select a template'} />
						</SelectTrigger>
						<SelectContent>
							{templates.map((t) => (
								<SelectItem key={t.id} value={t.id}>
									{t.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedTemplatePreview && (
						<div className="bg-muted rounded-md p-3">
							<Label className="mb-1 block text-xs font-medium">Preview</Label>
							<p className="text-sm whitespace-pre-wrap">{selectedTemplatePreview}</p>
						</div>
					)}
				</div>
			)}

			{mode === 'freetext' && (
				<div className="space-y-3">
					{channel === MessageChannel.email && (
						<div>
							<Label htmlFor="free-text-subject">Subject</Label>
							<Input
								id="free-text-subject"
								placeholder="Email subject"
								value={freeTextSubject}
								onChange={(e) => onFreeTextSubjectChange(e.target.value)}
							/>
						</div>
					)}
					<div>
						<Label htmlFor="free-text-body">Message</Label>
						<textarea
							id="free-text-body"
							className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Type your message..."
							value={freeTextBody}
							onChange={(e) => onFreeTextBodyChange(e.target.value)}
							rows={6}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
