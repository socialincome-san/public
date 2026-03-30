import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { getLocalPartnerId } from '@/components/storyblok/local-partner/local-partner.utils';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

const getLocalPartnerStats = async (localPartnerId: string) => {
	const statsResult = await services.read.localPartner.getPublicLocalPartnerStatsById(localPartnerId);

	return statsResult.success ? statsResult.data : undefined;
};

export const StoryblokPreviewLocalPartnerPage = async ({
	storyPath,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<LocalPartnerStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<LocalPartnerStory>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const localPartnerId = getLocalPartnerId(story.content);
			const stats = localPartnerId ? await getLocalPartnerStats(localPartnerId) : undefined;

			return (
				<LocalPartnerDetail
					localPartner={story}
					lang={lang}
					region={region}
					assignedRecipientsCount={stats?.assignedRecipientsCount}
					waitingRecipientsCount={stats?.waitingRecipientsCount}
				/>
			);
		},
	});
};
