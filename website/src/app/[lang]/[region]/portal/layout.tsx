import { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
	const isEnabled = process.env.FEATURE_ENABLE_PORTAL === 'true';

	if (!isEnabled) {
		return null;
	}

	return <>{children}</>;
}
