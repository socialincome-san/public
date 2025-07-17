import { I18nContext } from '@/lib/i18n/i18n-context-provider';
import { useContext } from 'react';

export const useI18n = () => {
	const i18nContext = useContext(I18nContext);
	if (!i18nContext) {
		throw new Error('useI18n must be used within a I18nContextProvider');
	}
	return i18nContext;
};
