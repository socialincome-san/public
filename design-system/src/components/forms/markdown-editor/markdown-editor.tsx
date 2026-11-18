'use client';

import { Bold, Italic, Link, List } from 'lucide-react';
import { type ComponentProps, type ReactNode, type Ref, useRef, useState } from 'react';
import { cn } from '../../../cn';
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
	Omit<ComponentProps<'textarea'>, 'value' | 'defaultValue' | 'onChange' | 'ref' | 'style'>
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
	readOnly,
	onFocus,
	...textareaProps
}: MarkdownEditorProps) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [mode, setMode] = useState<'write' | 'preview'>('write');
	const invalid = textareaProps['aria-invalid'] === true || textareaProps['aria-invalid'] === 'true';
	// An invalid value goes back to Write, so it stays visible while it is fixed.
	if (invalid && mode === 'preview') {
		setMode('write');
	}
	const isPreview = mode === 'preview' && !invalid;
	const canFormat = !disabled && !readOnly && !isPreview;

	const setTextareaRef = (element: HTMLTextAreaElement) => {
		textareaRef.current = element;
		const cleanup = typeof ref === 'function' ? ref(element) : undefined;
		if (ref && typeof ref === 'object') {
			ref.current = element;
		}

		return () => {
			textareaRef.current = null;
			if (typeof cleanup === 'function') {
				cleanup();
			} else if (typeof ref === 'function') {
				ref(null);
			} else if (ref) {
				ref.current = null;
			}
		};
	};

	const format = (markdownFormat: MarkdownFormat) => {
		const textarea = textareaRef.current;
		if (!textarea || !canFormat) {
			return;
		}
		// The textarea normalizes line breaks, so its own value matches the selection offsets.
		const edit = applyMarkdownFormat(
			{ value: textarea.value, selectionStart: textarea.selectionStart, selectionEnd: textarea.selectionEnd },
			markdownFormat,
			labels.link,
		);
		onChange(edit.value);
		// The new value reaches the textarea on the next render, unless something replaced it meanwhile.
		requestAnimationFrame(() => {
			if (!textarea.isConnected || textarea.value !== edit.value) {
				return;
			}
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
							disabled={!canFormat}
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
			{/* Only visually hidden in Preview, so a form can still focus the field, which switches back to Write. */}
			<div className={cn('px-3 py-2', isPreview && 'sr-only')}>
				<Textarea
					{...textareaProps}
					ref={setTextareaRef}
					variant="bare"
					resize="vertical"
					value={value}
					disabled={disabled}
					readOnly={readOnly}
					onFocus={(event) => {
						setMode('write');
						onFocus?.(event);
					}}
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
