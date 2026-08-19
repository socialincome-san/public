import {
	FALLBACK_VIEW_BOX_SIZE,
	GLOBE_COLORS,
	GLOBE_SPHERE_OPACITY,
	INITIAL_GLOBE_VIEW,
} from '@/components/globe/globe-config';
import { isCountryGeoJson } from '@/lib/services/country/country-geojson.utils';
import { geoOrthographic, geoPath } from 'd3-geo';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const inputPath = path.join(process.cwd(), 'public/assets/globe/countries-110m.json');
const outputPath = path.join(process.cwd(), 'public/assets/globe/globe-fallback.svg');
const center = FALLBACK_VIEW_BOX_SIZE / 2;
const radius = center * 0.94;

const generateFallback = async () => {
	const payload: unknown = JSON.parse(await readFile(inputPath, 'utf8'));

	if (!isCountryGeoJson(payload)) {
		throw new Error('Country GeoJSON is not a valid FeatureCollection.');
	}

	const projection = geoOrthographic()
		.rotate([-INITIAL_GLOBE_VIEW.lng, -INITIAL_GLOBE_VIEW.lat])
		.translate([center, center])
		.scale(radius)
		.clipAngle(90)
		.precision(0.5);
	const pathGenerator = geoPath(projection);
	const countryPaths = payload.features
		.map((feature) => pathGenerator(feature))
		.filter((countryPath): countryPath is string => countryPath !== null)
		.map((countryPath) => `\t<path d="${countryPath}" fill="${GLOBE_COLORS.hexagon}" />`)
		.join('\n');
	const svg = [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FALLBACK_VIEW_BOX_SIZE} ${FALLBACK_VIEW_BOX_SIZE}" role="presentation">`,
		'\t<metadata>Natural Earth 1:110m Admin 0 countries</metadata>',
		`\t<circle cx="${center}" cy="${center}" r="${radius}" fill="${GLOBE_COLORS.sphere}" fill-opacity="${GLOBE_SPHERE_OPACITY}" />`,
		`\t<g fill-rule="evenodd">${countryPaths ? `\n${countryPaths}\n\t` : ''}</g>`,
		'</svg>',
		'',
	].join('\n');

	await writeFile(outputPath, svg, 'utf8');
};

void generateFallback();
