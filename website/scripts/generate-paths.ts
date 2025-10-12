import * as fs from 'fs';
import * as path from 'path';

// Currently there is no standard way to get all static paths of NextJS
function getStaticPages(startPath: string): string[] {
	const routes: string[] = [];
	const excludedPrefixes = ['_', '['];
	function traverse(currentPath: string, currentRoute = '') {
		const directoryEntries = fs.readdirSync(currentPath, { withFileTypes: true });

		for (const directoryEntry of directoryEntries) {
			const fullPath = path.join(currentPath, directoryEntry.name);
			if (!excludedPrefixes.some((char) => directoryEntry.name.startsWith(char))) {
				if (directoryEntry.isDirectory()) {
					traverse(
						fullPath,
						directoryEntry.name.startsWith('(') ? currentRoute : `${currentRoute}/${directoryEntry.name}`,
					);
				} else if (
					(directoryEntry.isFile() && directoryEntry.name === 'page.tsx') ||
					directoryEntry.name === 'page.ts'
				) {
					const route = `${currentRoute}/${directoryEntry.name.replace(/page\.(tsx|ts)$/, '')}`
						.replace(/^\//, '')
						.replace(/\/+$/, '');
					routes.push(route);
				}
			}
		}
	}
	traverse(startPath);
	return routes;
}

function writePagesToFile(pages: string[], folderPath: string, fileName: string) {
	fs.mkdirSync(folderPath, { recursive: true });
	const filePath = path.join(folderPath, fileName);
	const content = JSON.stringify(pages, null, 2);
	fs.writeFileSync(filePath, content);
	console.log(`Successfully wrote ${pages.length} paths to ${filePath}`);
}

const WEBSITE_LOCAL_PATH = 'src/app/[lang]/[region]/(website)';
const pages = getStaticPages(path.join(process.cwd(), WEBSITE_LOCAL_PATH));
const outputFolder = path.join(process.cwd(), 'src/app/');
const outputFile = 'static-pages.json';

writePagesToFile(pages, outputFolder, outputFile);
