import type { CommunityPage } from '@/modules/community/community.schemas';

export const pickCommunityPage = ({
	communityEnabled,
	communityContributors,
	communityContactEmail,
	communityArticles,
}: CommunityPage): CommunityPage => ({
	communityEnabled,
	communityContributors,
	communityContactEmail,
	communityArticles,
});
