import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';

export default async function ProfilePage() {
	const user = await getAuthenticatedUserOrRedirect();

	return <TranslatedProfileForm session={user} />;
}
