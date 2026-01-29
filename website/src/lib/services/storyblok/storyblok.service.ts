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
								{ label: 'Link 1.1', href: '#' },
								{ label: 'Link 1.2', href: '#' },
								{ label: 'Link 1.3', href: '#' },
							],
						},
						{
							title: 'Section 2',
							items: [
								{ label: 'Link 1.4', href: '#' },
								{ label: 'Link 1.5', href: '#' },
								{ label: 'Link 1.6', href: '#' },
							],
						},
						{
							title: 'Section 3',
							items: [
								{ label: 'Link 1.7', href: '#' },
								{ label: 'Link 1.8', href: '#' },
								{ label: 'Link 1.9', href: '#' },
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
								{ label: 'Link 2.1', href: '#' },
								{ label: 'Link 2.2', href: '#' },
								{ label: 'Link 2.3', href: '#' },
							],
						},
						{
							title: 'Section 2',
							items: [
								{ label: 'Link 2.1', href: '#' },
								{ label: 'Link 2.2', href: '#' },
								{ label: 'Link 2.3', href: '#' },
							],
						},
						{
							title: 'Section 3',
							items: [
								{ label: 'Link 2.7', href: '#' },
								{ label: 'Link 2.8', href: '#' },
								{ label: 'Link 2.9', href: '#' },
							],
						},
					],
				},
				{
					label: 'Link 3',
					href: '#',
				},
			];

			return this.resultOk(hardcodedNavItems);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch navigation items: ${JSON.stringify(error)}`);
		}
	}
}
