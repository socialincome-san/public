import { type Messages } from '@/lib/i18n/messages';
import { type MessageKeys, type NestedKeyOf } from 'next-intl';

export type NamespaceMessageKey<Namespace extends keyof Messages> = MessageKeys<
	Messages[Namespace],
	NestedKeyOf<Messages[Namespace]>
>;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

// For keys built from runtime data (database values, survey answers) that the compiler cannot check.
export const isMessageKey = <Namespace extends keyof Messages>(
	messages: Messages,
	namespace: Namespace,
	key: string,
): key is NamespaceMessageKey<Namespace> => {
	const value = key
		.split('.')
		.reduce<unknown>((node, segment) => (isRecord(node) ? node[segment] : undefined), messages[namespace]);

	return typeof value === 'string';
};
