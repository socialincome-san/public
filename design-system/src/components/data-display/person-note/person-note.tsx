import NextLink from 'next/link';
import { type ReactNode } from 'react';
import { AvatarStack } from '../avatar-stack/avatar-stack';

type PersonNoteProps = {
	name: string;
	imageSrc?: string;
	/** One short sentence, usually starting with the person's name; link words with PersonNoteLink */
	children: ReactNode;
};

export const PersonNote = ({ name, imageSrc, children }: PersonNoteProps) => (
	<div className="flex items-center gap-3">
		<AvatarStack people={[{ name, imageSrc }]} size="lg" />
		<p className="text-foreground min-w-0 text-sm">{children}</p>
	</div>
);

export const PersonNoteLink = ({ href, children }: { href: string; children: ReactNode }) => (
	<NextLink
		href={href}
		className="decoration-border font-medium underline underline-offset-4 transition-colors hover:decoration-current"
	>
		{children}
	</NextLink>
);
