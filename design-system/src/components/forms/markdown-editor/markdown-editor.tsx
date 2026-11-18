'use client';

import { Bold, Italic, Link, List } from 'lucide-react';
import { type ComponentProps, type ReactNode, type Ref, useRef, useState } from 'react';
import { type WithoutClassName } from '../../../without-class-name';
import { Button } from '../../actions/button/button';
import { SegmentedToggle } from '../../actions/segmented-toggle/segmented-toggle';
import { Textarea } from '../textarea/textarea';
import { applyMarkdownFormat, type MarkdownFormat } from './markdown-formatting';

export type MarkdownEditorLabels = {
	toolbar: string;
	write: string;
	preview: string;
	emptyPreview: string;
	hint?: string;
} & Record<MarkdownFormat, string>;

type MarkdownEditorProps = WithoutClassName<
	Omit<ComponentProps<'textarea'>, 'value' | 'defaultValue' | 'onChange' | 'ref'>
> & {
	value: string;
	onChange: (value: string) => void;
	// Renders the Markdown the way readers will see it
	renderPreview: (value: string) => ReactNode;
	labels: MarkdownEditorLabels;
	ref?: Ref<HTMLTextAreaElement>;
};

const formats = [
	{ format: 'bold', icon: Bold },
	{ format: 'italic', icon: Italic },
	{ format: 'bulletList', icon: List },
	{ format: 'link', icon: Link },
] as const satisfies readonly { format: MarkdownFormat; icon: typeof Bold }[];

export const MarkdownEditor = ({
	value,
	onChange,
	renderPreview,
	labels,
	ref,
	disabled,
	...textareaProps
}: MarkdownEditorProps) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [mode, setMode] = useState<'write' | 'preview'>('write');
	// An invalid value must stay visible, so the field can be fixed and focused.
	const invalid = textareaProps['aria-invalid'];
	const isPreview = mode === 'preview' && invalid !== true && invalid !== 'true';

	const setTextareaRef = (element: HTMLTextAreaElement | null) => {
		textareaRef.current = element;
		if (typeof ref === 'function') {
			ref(element);
		} else if (ref) {
			ref.current = element;
		}
	};

	const format = (markdownFormat: MarkdownFormat) => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}
		const edit = applyMarkdownFormat(
			{ value, selectionStart: textarea.selectionStart, selectionEnd: textarea.selectionEnd },
			markdownFormat,
		);
		onChange(edit.value);
		// The new value reaches the textarea on the next render.
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
		});
	};

	return (
		<div className="border-border focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:border-destructive flex flex-col rounded-2xl border shadow-xs focus-within:ring-[3px]">
			<div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-2 py-1.5">
				<div className="flex items-center gap-1" role="group" aria-label={labels.toolbar}>
					{formats.map(({ format: markdownFormat, icon: Icon }) => (
						<Button
							key={markdownFormat}
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={labels[markdownFormat]}
							title={labels[markdownFormat]}
							disabled={Boolean(disabled) || isPreview}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => format(markdownFormat)}
						>
							<Icon />
						</Button>
					))}
				</div>
				<SegmentedToggle
					value={isPreview ? 'preview' : 'write'}
					onValueChange={(next) => setMode(next === 'preview' ? 'preview' : 'write')}
					options={[
						{ value: 'write', label: labels.write },
						{ value: 'preview', label: labels.preview },
					]}
				/>
			</div>
			<div className="px-3 py-2" hidden={isPreview}>
				<Textarea
					{...textareaProps}
					ref={setTextareaRef}
					variant="bare"
					resize="vertical"
					value={value}
					disabled={disabled}
					onChange={(event) => onChange(event.target.value)}
				/>
			</div>
			{isPreview ? (
				<div className="min-h-24 px-3 py-2">
					{value.trim() ? renderPreview(value) : <p className="text-muted-foreground text-sm">{labels.emptyPreview}</p>}
				</div>
			) : null}
			{labels.hint ? <p className="text-muted-foreground border-border border-t px-3 py-2 text-xs">{labels.hint}</p> : null}
		</div>
	);
};
