'use client';

import { cn } from '@/lib/utils/cn';
import { UploadIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

type Props = {
	onFileSelected: (file: File) => void;
};

export const CsvDropzone = ({ onFileSelected }: Props) => {
	const onDrop = (files: File[]) => {
		const file = files[0];

		if (!file) {
			return;
		}

		onFileSelected(file);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: { 'text/csv': ['.csv'] },
		maxFiles: 1,
		onDrop,
	});

	return (
		<div
			{...getRootProps()}
			className={cn(
				'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition',
				isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
			)}
		>
			<input data-testid="csv-dropzone-input" {...getInputProps()} />

			<UploadIcon className="text-muted-foreground mb-3 h-7 w-7" />

			<p className="text-sm font-medium">Drag & drop a CSV here</p>

			<p className="text-muted-foreground mt-1 text-xs">or click to select a file</p>
		</div>
	);
}
