import { UserRound } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '../../actions/button/button';

type LoginLinkProps = {
	href: string;
	label: string;
};

export const LoginLink = ({ href, label }: LoginLinkProps) => (
	<Button asChild variant="ghost" size="md">
		<NextLink href={href} data-testid="login-button">
			<UserRound />
			{label}
		</NextLink>
	</Button>
);
