import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { NavItem } from './storyblok.types';

export class StoryblokService extends BaseService {
	async getNavItems(): Promise<ServiceResult<NavItem[]>> {
		try {
			// this nav is already live in the contributor-dashboard, it's ok if the nav is just empty for them now
			if (process.env.FEATURE_ENABLE_NEW_WEBSITE !== 'true') {
				return this.resultOk([]);
			}

			//Todo: replace by getting real nav items from storyblok
			const hardcodedNavItems: NavItem[] = [
				{
					label: 'Link 1',
					href: '#',
					sections: [
						{
							title: 'Section 1',
							items: [
								{ label: 'Link 1.1', href: '/link-1.1' },
								{ label: 'Link 1.2', href: '/link-1.2' },
								{ label: 'Link 1.3', href: '/link-1.3' },
							],
						},
						{
							title: 'Section 2',
							items: [
								{ label: 'Link 1.4', href: '/link-1.4' },
								{ label: 'Link 1.5', href: '/link-1.5' },
								{ label: 'Link 1.6', href: '/link-1.6' },
							],
						},
						{
							title: 'Section 3',
							items: [
								{ label: 'Link 1.7', href: '/link-1.7' },
								{ label: 'Link 1.8', href: '/link-1.8' },
								{ label: 'Link 1.9', href: '/link-1.9' },
							],
						},
					],
				},
				{
					label: 'Link 2',
					href: '#',
					sections: [
						{
							title: 'Section 1',
							items: [
								{ label: 'Link 2.1', href: '/link-2.1' },
								{ label: 'Link 2.2', href: '/link-2.2' },
								{ label: 'Link 2.3', href: '/link-2.3' },
							],
						},
						{
							title: 'Section 2',
							items: [
								{ label: 'Link 2.1', href: '/link-2.1' },
								{ label: 'Link 2.2', href: '/link-2.2' },
								{ label: 'Link 2.3', href: '/link-2.3' },
							],
						},
						{
							title: 'Section 3',
							items: [
								{ label: 'Link 2.7', href: '/link-2.7' },
								{ label: 'Link 2.8', href: '/link-2.8' },
								{ label: 'Link 2.9', href: '/link-2.9' },
							],
						},
					],
				},
				{
					label: 'Link 3',
					href: '/link-3',
				},
			];

			return this.resultOk(hardcodedNavItems);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch navigation items: ${JSON.stringify(error)}`);
		}
	}
}
