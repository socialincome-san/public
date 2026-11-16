/** @jest-environment jsdom */

import { type ComponentProps } from 'react';
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

	it('puts the actions in the row of the description when beside, after it when below, unless an illustration takes the room', () => {
		const props = { title: 'Our programs', description: 'Our work', actions: <button>Start</button> };
		const render = (extra: Partial<ComponentProps<typeof PageIntro>>) => {
			const container = document.createElement('div');
			container.innerHTML = renderToStaticMarkup(<PageIntro {...props} {...extra} />);
			const description = container.querySelector('p');
			const button = container.querySelector('button');

			return { description, button, row: description?.parentElement, intro: container.querySelector('h1')?.parentElement };
		};

		const beside = render({ actionsPosition: 'beside' });
		expect(beside.row).not.toBe(beside.intro);
		expect(beside.row?.contains(beside.button)).toBe(true);

		for (const below of [render({}), render({ actionsPosition: 'beside', illustrationSrc: '/bike.png' })]) {
			expect(below.row).toBe(below.intro);
			expect(below.row?.contains(below.button)).toBe(true);
			expect(below.description?.nextElementSibling).toBe(below.button?.parentElement);
		}
	});

	it('renders nothing without content', () => {
		expect(renderToStaticMarkup(<PageIntro title=" " description=" " eyebrow=" " />)).toBe('');
	});
});
