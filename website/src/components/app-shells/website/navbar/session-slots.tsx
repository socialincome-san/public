'use client';

import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import type { Session } from '@/modules/auth/auth.types';
import { useCallback, useSyncExternalStore, type PropsWithChildren } from 'react';

type Props = {
	sessions: Promise<Session[]>;
	scope: Scope;
};

const resolvedSessions = new WeakMap<Promise<Session[]>, Session[]>();

// Renders signed out until the sessions resolve, so the shell needs no session. Unlike `use()` with Suspense, this
// never remounts the signed-out slot: a remount would close a login flyout the visitor just opened.
const useDisplaySession = ({ sessions, scope }: Props) => {
	const subscribe = useCallback(
		(onChange: () => void) => {
			let subscribed = true;
			void sessions.then((value) => {
				resolvedSessions.set(sessions, value);
				if (subscribed) {
					onChange();
				}
			});

			return () => {
				subscribed = false;
			};
		},
		[sessions],
	);
	const resolved = useSyncExternalStore(
		subscribe,
		() => resolvedSessions.get(sessions),
		() => undefined,
	);

	return resolved ? { sessions: resolved, session: displaySession(resolved, scope) } : null;
};

export const AccountSlot = (props: Props) => {
	const current = useDisplaySession(props);

	return current?.session ? <AccountMenu sessions={current.sessions} scope={props.scope} /> : <LoginFlyout />;
};

export const SignedOutSlot = ({ children, ...props }: PropsWithChildren<Props>) =>
	useDisplaySession(props)?.session ? null : children;
