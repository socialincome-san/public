import { DefaultPageProps } from '@/app/[lang]/[region]';
import PrivacySection from '@/app/[lang]/[region]/(website)/legal/privacy-section';
import TermsOfUseSection from '@/app/[lang]/[region]/(website)/legal/terms-of-use-section';
import TermsAndConditionsSection from '@/app/[lang]/[region]/(website)/legal/terms-and-conditions-section';


export default async function Page(props: DefaultPageProps) {

	return (
		<>
			<PrivacySection {...props} />
			<TermsOfUseSection {...props} />
			<TermsAndConditionsSection {...props} />
		</>
	)
}