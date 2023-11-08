import { I18nProviderClient } from '@/app/providers/i18n-provider-client';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

export function I18nProvider({ children }: PropsWithChildren) {
	/**
	 * The I18nProviderClient is wrapped into this component so that the values of the cookies are also available on SSR.
	 * Without this, the HTML rendered on the client can be different from the HTML rendered on the server, which causes
	 * hydration issues.
	 */
	const cookiesMap = new Map(
		cookies()
			.getAll()
			.map((obj) => [obj.name, obj.value]),
	);
	return <I18nProviderClient cookies={cookiesMap}>{children}</I18nProviderClient>;
}
