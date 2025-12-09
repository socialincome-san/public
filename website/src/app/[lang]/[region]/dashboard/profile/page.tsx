import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { DefaultPageProps } from '../..';
import { ProfileForm } from './profile-form';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	return <ProfileForm contributor={contributor} />;
}
