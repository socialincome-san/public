import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { requireSession } from '@/server/session';

export default async function Page() {
	const session = await requireSession('local-partner');

	return <TranslatedProfileForm session={session} />;
}
