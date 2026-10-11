import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { requireSession } from '@/server/session';

export default async function ProfileAccountPage() {
	const user = await requireSession('user');

	return <TranslatedProfileForm session={user} />;
}
