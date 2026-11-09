'use client';

import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import { createResolvedPromiseHook } from '@/lib/hooks/use-resolved-promise';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import type { Session } from '@/modules/auth/auth.types';
import { LoginLink } from '@socialincome/design-system/navigation/login-link/login-link';
import { useTranslations } from 'next-intl';
import { type PropsWithChildren } from 'react';

type Props = {
	sessions: Promise<Session[]>;
	scope: Scope;
};

const useResolvedSessions = createResolvedPromiseHook<Session[]>();

const useDisplaySession = ({ sessions, scope }: Props) => {
	const resolved = useResolvedSessions(sessions)?.value;

	return resolved ? { sessions: resolved, session: displaySession(resolved, scope) } : null;
};

export const AccountSlot = (props: Props) => {
	const current = useDisplaySession(props);
	const t = useTranslations('website-login');
	const loginPath = `${useWebsiteBasePath()}/login`;

	return current?.session ? (
		<AccountMenu sessions={current.sessions} scope={props.scope} />
	) : (
		<LoginLink href={loginPath} label={t('nav-label')} />
	);
};

export const SignedOutSlot = ({ children, ...props }: PropsWithChildren<Props>) =>
	useDisplaySession(props)?.session ? null : children;
