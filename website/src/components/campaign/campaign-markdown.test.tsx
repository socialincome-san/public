import { renderToStaticMarkup } from 'react-dom/server';
import { CampaignMarkdown } from './campaign-markdown';

const markup = (markdown: string) => renderToStaticMarkup(<CampaignMarkdown>{markdown}</CampaignMarkdown>);

describe('CampaignMarkdown', () => {
	test('renders inline formatting, lists and links', () => {
		const html = markup('**Thanks** _all_\n\n- one\n- two\n\n[Site](https://example.org)');

		expect(html).toContain('<strong>Thanks</strong> <em>all</em>');
		expect(html).toContain('<li>one</li>');
		expect(html).toContain('<a href="https://example.org" target="_blank" rel="nofollow ugc noopener noreferrer">Site</a>');
	});

	test('keeps single line breaks of plain text descriptions', () => {
		expect(markup('first\nsecond')).toContain('first<br/>\nsecond');
	});

	test('renders headings and images as plain text and drops HTML', () => {
		const html = markup('# Big\n\n![alt](https://example.org/a.png)\n\n<script>alert(1)</script>');

		expect(html).not.toMatch(/<h1|<img|<script/);
		expect(html).toContain('Big');
	});

	test('adds https to links typed without a scheme', () => {
		expect(markup('[site](www.example.org)')).toContain('href="https://www.example.org"');
	});

	test('drops links that are not web or mail addresses', () => {
		const html = markup('[click](javascript:alert(1)) [home](/en/ch)');

		expect(html).not.toContain('href');
		expect(html).toContain('click');
	});
});
