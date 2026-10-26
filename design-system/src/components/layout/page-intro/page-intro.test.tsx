import { renderToStaticMarkup } from 'react-dom/server';
import { PageIntro } from './page-intro';

describe('PageIntro', () => {
	it('keeps the default page heading', () => {
		const markup = renderToStaticMarkup(<PageIntro title="Our programs" description="Our work" />);
		expect(markup).toContain('<h1');
		expect(markup).toContain('md:text-6xl');
		expect(markup).not.toContain('<h2');
	});

	it('renders a section heading and trims optional text', () => {
		const markup = renderToStaticMarkup(
			<PageIntro variant="section" eyebrow=" Country office " title=" Liberia " description=" Local team " />,
		);
		expect(markup).toContain('<h2');
		expect(markup).not.toContain('<h1');
		expect(markup).toContain('>Country office</p>');
		expect(markup).toContain('>Liberia</h2>');
		expect(markup).toContain('>Local team</p>');
	});

	it('omits blank optional text', () => {
		const markup = renderToStaticMarkup(<PageIntro variant="section" title="Liberia" eyebrow=" " description=" " />);
		expect(markup).toContain('<h2');
		expect(markup).not.toContain('<p');
	});

	it('renders nothing without content', () => {
		expect(renderToStaticMarkup(<PageIntro title=" " description=" " eyebrow=" " />)).toBe('');
	});
});
