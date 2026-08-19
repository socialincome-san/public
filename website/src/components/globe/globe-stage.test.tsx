import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { GlobeStage } from './globe-stage';

jest.mock('./globe-client-shell', () => ({
	GlobeClientShell: () => null,
}));

describe('GlobeStage', () => {
	it('server-renders the fallback in the initial response', () => {
		const markup = renderToStaticMarkup(<GlobeStage />);

		expect(markup).toContain('data-globe-stage="true"');
		expect(markup).toContain('data-ready="false"');
		expect(markup).toContain('<svg');
		expect(markup).toContain('<circle');
		expect(markup).toContain('<path');
		expect(markup).toContain('opacity-100');
	});

	it('keeps the surrounding section as Server Components', async () => {
		const srcRoot = path.join(process.cwd(), 'src');
		const [stageSource, fallbackSource, blockSource, shellSource] = await Promise.all([
			readFile(path.join(srcRoot, 'components/globe/globe-stage.tsx'), 'utf8'),
			readFile(path.join(srcRoot, 'components/globe/globe-fallback.tsx'), 'utf8'),
			readFile(path.join(srcRoot, 'components/content-blocks/donation-globe-block.tsx'), 'utf8'),
			readFile(path.join(srcRoot, 'components/globe/globe-client-shell.tsx'), 'utf8'),
		]);

		expect(stageSource).not.toMatch(/['"]use client['"]/);
		expect(fallbackSource).not.toMatch(/['"]use client['"]/);
		expect(blockSource).not.toMatch(/['"]use client['"]/);
		expect(shellSource).toContain('next/dynamic');
		expect(shellSource).toContain('ssr: false');
	});
});
