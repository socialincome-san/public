'use client';

import { PANEL_SURFACE_CLASS } from '@/components/behind-the-scenes/behind-the-scenes.styles';
import { useBehindTheScenes } from '@/components/behind-the-scenes/use-behind-the-scenes';
import { cn } from '@socialincome/design-system/cn';
import { X } from 'lucide-react';

type Props = {
	label: string;
};

/**
 * Icon-only close, following the dialog's close button — but opaque rather than opacity-70. The
 * dialog sits on a scrim with nothing moving behind it; here the panel scrolls underneath, and a
 * translucent button lets that text show through the icon.
 */
export const BehindTheScenesCloseButton = ({ label }: Props) => {
	const { toggle } = useBehindTheScenes();

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={label}
			className={cn(
				'ring-offset-background focus:ring-ring text-muted-foreground hover:text-foreground rounded-full border border-white p-3 shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden focus-visible:ring-[3px]',
				PANEL_SURFACE_CLASS,
			)}
		>
			<X className="h-6 w-6" aria-hidden />
		</button>
	);
};
