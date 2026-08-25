import { renderToStaticMarkup } from 'react-dom/server';
import { GlobeStage } from './globe-stage';

jest.mock('./globe-client-shell', () => ({
	GlobeClientShell: () => null,
}));

describe('GlobeStage', () => {
	it('server-renders the fallback in the initial response', () => {
		const markup = renderToStaticMarkup(
			<GlobeStage contributions={[]} locale="en-US" label="Recent donations around the world" />,
		);

		expect(markup).toContain('data-globe-stage="true"');
		expect(markup).toContain('data-ready="false"');
		expect(markup).toContain('role="img"');
		expect(markup).toContain('aria-label="Recent donations around the world"');
		expect(markup).toContain('<img');
		expect(markup).toContain('/assets/globe/globe-fallback.svg');
		expect(markup).toContain('opacity-100');
	});
});
