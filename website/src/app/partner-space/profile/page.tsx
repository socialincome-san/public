import { Card } from '@/components/card';
import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';

export default async function Page() {
  const session = await getAuthenticatedLocalPartnerOrRedirect();

  return (
    <Card>
      <TranslatedProfileForm session={session} />
    </Card>
  );
}
