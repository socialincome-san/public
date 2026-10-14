import { LoginPanel } from '@/components/login/login-panel';
import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';

type Props = {
	prefilledEmail: string;
};

export const LoginPageContent = ({ prefilledEmail }: Props) => (
	<LoginPanel>
		<MagicLinkLoginForm prefilledEmail={prefilledEmail} />
	</LoginPanel>
);
