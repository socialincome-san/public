import { UserRound } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '../../actions/button/button';

type LoginLinkProps = {
	href: string;
	label: string;
};

// Shown on every page, so prefetching would request the dynamic login route for every visitor
export const LoginLink = ({ href, label }: LoginLinkProps) => (
	<Button asChild variant="nav" size="nav">
		<NextLink href={href} prefetch={false} data-testid="login-button">
			<UserRound />
			{label}
		</NextLink>
	</Button>
);
