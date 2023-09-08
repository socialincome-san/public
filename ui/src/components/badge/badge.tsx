'use client';

import { Badge as DaisyUIBadge } from 'react-daisyui';
import { BadgeProps } from 'react-daisyui/dist/Badge/Badge';

export function Badge(props: BadgeProps) {
	return <DaisyUIBadge {...props} />;
}
