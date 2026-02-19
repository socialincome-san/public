'use client';

import { Button } from '@/components/button';
import { CheckIcon, CopyIcon, DownloadIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
  id: number;
  value: string | object | string[] | null;
  filename: string;
  onClear: () => void;
};

export const StepResultBox = ({ id, value, filename, onClear }: Props) => {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return null;
  }

  const isObject = typeof value === 'object';
  const text = isObject ? JSON.stringify(value, null, 2) : String(value);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[540px] rounded-lg border border-border bg-muted p-2 text-xs">
      <div className="mb-1 flex items-center justify-end gap-1">
        <Button size="icon" variant="ghost" onClick={handleCopy} title="Copy to clipboard">
          {copied ? <CheckIcon className="h-3 w-3 text-green-600" /> : <CopyIcon className="h-3 w-3" />}
        </Button>

        <Button size="icon" variant="ghost" onClick={handleDownload} title="Download file">
          <DownloadIcon className="h-3 w-3" />
        </Button>

        <Button size="icon" variant="ghost" onClick={onClear} title="Clear result">
          <XIcon className="h-3 w-3" />
        </Button>
      </div>

      <pre data-testid={`step-result-box-${id}`} className="max-h-[240px] overflow-auto whitespace-pre">
        {text}
      </pre>
    </div>
  );
};
