import { newWebsiteNoIndexMetadata, newWebsiteRobotsTxtDisallowPaths } from './new-website-indexing';

describe('newWebsiteRobotsTxtDisallowPaths', () => {
	it('disallows all locale/region new-website paths', () => {
		expect(newWebsiteRobotsTxtDisallowPaths()).toEqual(['/*/*/new-website', '/*/*/new-website/']);
	});
});

describe('newWebsiteNoIndexMetadata', () => {
	it('opts out of indexing for crawlers', () => {
		expect(newWebsiteNoIndexMetadata()).toEqual({
			robots: {
				index: false,
				follow: false,
				nocache: true,
				googleBot: {
					index: false,
					follow: false,
					noimageindex: true,
				},
			},
		});
	});
});
