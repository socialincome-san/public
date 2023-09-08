'use client';

import { Tooltip as DaisyUITooltip } from 'react-daisyui';
import { TooltipProps } from 'react-daisyui/dist/Tooltip/Tooltip';

export function Tooltip(props: TooltipProps) {
	return <DaisyUITooltip {...props} />;
}
