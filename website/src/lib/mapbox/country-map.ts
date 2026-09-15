type CountryBoundingBox = [number, number, number, number];
type MapboxMapVariant = 'main' | 'inset';

type BoundaryStyle = {
	fill: string;
	fillOpacity: number;
	outline: string;
};

type VariantConfig = {
	padding: number;
	imageSize: number;
	// Mapbox sizes labels in logical pixels, so rendering at @2x doubles the label
	// size relative to the map while keeping the same output resolution.
	renderScale: 1 | 2;
	boundaryStyle: BoundaryStyle;
	customStyleUrl: string;
	showSurroundingCountries: boolean;
	surroundingCountriesStyle?: BoundaryStyle;
};

type CountryStaticMapUrlOptions = {
	accessToken: string;
	isoCode: string;
	variant?: MapboxMapVariant;
};

type GeocodingCountryContext = {
	country_code?: string;
	country_code_alpha_3?: string;
};

type GeocodingCountryFeature = {
	geometry?: {
		coordinates?: [number, number];
	};
	properties?: {
		bbox?: number[];
		context?: {
			country?: GeocodingCountryContext;
		};
	};
};

type TilequeryBoundaryFeature = {
	properties?: {
		disputed?: string;
		iso_3166_1?: string;
		region?: string;
	};
};

type CountryMapData = {
	boundingBox: CountryBoundingBox;
	center: [number, number];
	isoCode: string;
	region: string | null;
	subregion: CountrySubregion | null;
};

type MapboxStyleReference = {
	styleId: string;
	username: string;
};

type UnknownRecord = Record<string, unknown>;

const MAPBOX_DATA_REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours
const MAPBOX_COUNTRY_BOUNDARIES_SOURCE_URL = 'mapbox://mapbox.country-boundaries-v1';
const MAPBOX_COUNTRY_BOUNDARIES_SOURCE_LAYER = 'country_boundaries';
const MAPBOX_BOUNDARY_INSERT_BEFORE_LAYER = 'country-label';
const MAIN_MAP_CUSTOM_STYLE_URL = 'mapbox://styles/socialincome/cmov6zy8j006u01sb4px41uld';
const INSET_MAP_CUSTOM_STYLE_URL = 'mapbox://styles/socialincome/cmp5dzq70000701qr07nh9ck9';

const REGION_BOUNDING_BOXES: Partial<Record<string, CountryBoundingBox>> = {
	Africa: [-25, -36, 63, 38],
	Americas: [-171, -57, -28, 84],
	Asia: [25, -10, 180, 82],
	Europe: [-31, 27, 45, 73],
	Oceania: [110, -50, 180, 10],
	Antarctic: [-180, -90, 180, -60],
};

const SUBREGION_BOUNDING_BOXES = {
	CentralAfrica: [5, -12, 35, 15],
	CentralAmericaAndCaribbean: [-100, 5, -55, 30],
	CentralAsia: [45, 35, 95, 56],
	EastAfrica: [20, -15, 55, 25],
	EastAsia: [95, 20, 150, 55],
	EasternEurope: [15, 40, 65, 72],
	MiddleEast: [25, 12, 65, 45],
	NorthAmerica: [-170, 14, -50, 84],
	NorthernAsia: [45, 45, 180, 82],
	Oceania: [110, -50, 180, 10],
	SouthAmerica: [-92, -57, -28, 15],
	SouthAsia: [60, 0, 97, 38],
	SoutheastAsia: [92, -12, 141, 30],
	SouthernAfrica: [10, -36, 42, -10],
	WestAfrica: [-25, -5, 20, 25],
	WesternEurope: [-15, 35, 20, 72],
} satisfies Record<string, CountryBoundingBox>;

type CountrySubregion = keyof typeof SUBREGION_BOUNDING_BOXES;

const COUNTRY_SUBREGION_BY_ISO_CODE: Partial<Record<string, CountrySubregion>> = {
	AO: 'SouthernAfrica',
	AR: 'SouthAmerica',
	AT: 'WesternEurope',
	AZ: 'MiddleEast',
	BD: 'SouthAsia',
	BE: 'WesternEurope',
	BF: 'WestAfrica',
	BI: 'EastAfrica',
	BJ: 'WestAfrica',
	BO: 'SouthAmerica',
	BR: 'SouthAmerica',
	BW: 'SouthernAfrica',
	CA: 'NorthAmerica',
	CD: 'CentralAfrica',
	CF: 'CentralAfrica',
	CG: 'CentralAfrica',
	CH: 'WesternEurope',
	CI: 'WestAfrica',
	CL: 'SouthAmerica',
	CM: 'CentralAfrica',
	CN: 'EastAsia',
	CO: 'SouthAmerica',
	CR: 'CentralAmericaAndCaribbean',
	CU: 'CentralAmericaAndCaribbean',
	CY: 'MiddleEast',
	CZ: 'EasternEurope',
	DE: 'WesternEurope',
	DJ: 'EastAfrica',
	DZ: 'WestAfrica',
	EC: 'SouthAmerica',
	EE: 'EasternEurope',
	EG: 'MiddleEast',
	ER: 'EastAfrica',
	ES: 'WesternEurope',
	ET: 'EastAfrica',
	FI: 'EasternEurope',
	FR: 'WesternEurope',
	GB: 'WesternEurope',
	GE: 'MiddleEast',
	GH: 'WestAfrica',
	GM: 'WestAfrica',
	GN: 'WestAfrica',
	GQ: 'CentralAfrica',
	GR: 'EasternEurope',
	GT: 'CentralAmericaAndCaribbean',
	GW: 'WestAfrica',
	HN: 'CentralAmericaAndCaribbean',
	HR: 'EasternEurope',
	HU: 'EasternEurope',
	ID: 'SoutheastAsia',
	IE: 'WesternEurope',
	IL: 'MiddleEast',
	IN: 'SouthAsia',
	IQ: 'MiddleEast',
	IR: 'MiddleEast',
	IS: 'WesternEurope',
	IT: 'WesternEurope',
	JM: 'CentralAmericaAndCaribbean',
	JO: 'MiddleEast',
	JP: 'EastAsia',
	KE: 'EastAfrica',
	KG: 'CentralAsia',
	KH: 'SoutheastAsia',
	KM: 'EastAfrica',
	KP: 'EastAsia',
	KR: 'EastAsia',
	KZ: 'CentralAsia',
	LA: 'SoutheastAsia',
	LB: 'MiddleEast',
	LK: 'SouthAsia',
	LR: 'WestAfrica',
	LS: 'SouthernAfrica',
	LT: 'EasternEurope',
	LU: 'WesternEurope',
	LV: 'EasternEurope',
	LY: 'MiddleEast',
	MA: 'WestAfrica',
	MD: 'EasternEurope',
	MG: 'EastAfrica',
	ML: 'WestAfrica',
	MM: 'SoutheastAsia',
	MN: 'NorthernAsia',
	MR: 'WestAfrica',
	MT: 'WesternEurope',
	MW: 'SouthernAfrica',
	MX: 'NorthAmerica',
	MY: 'SoutheastAsia',
	MZ: 'SouthernAfrica',
	NA: 'SouthernAfrica',
	NE: 'WestAfrica',
	NG: 'WestAfrica',
	NI: 'CentralAmericaAndCaribbean',
	NL: 'WesternEurope',
	NO: 'WesternEurope',
	NP: 'SouthAsia',
	NZ: 'Oceania',
	OM: 'MiddleEast',
	PA: 'CentralAmericaAndCaribbean',
	PE: 'SouthAmerica',
	PG: 'Oceania',
	PH: 'SoutheastAsia',
	PK: 'SouthAsia',
	PL: 'EasternEurope',
	PT: 'WesternEurope',
	PY: 'SouthAmerica',
	QA: 'MiddleEast',
	RO: 'EasternEurope',
	RU: 'NorthernAsia',
	RW: 'EastAfrica',
	SA: 'MiddleEast',
	SD: 'EastAfrica',
	SE: 'WesternEurope',
	SG: 'SoutheastAsia',
	SI: 'EasternEurope',
	SL: 'WestAfrica',
	SN: 'WestAfrica',
	SO: 'EastAfrica',
	SR: 'SouthAmerica',
	SS: 'EastAfrica',
	SV: 'CentralAmericaAndCaribbean',
	SY: 'MiddleEast',
	SZ: 'SouthernAfrica',
	TD: 'CentralAfrica',
	TG: 'WestAfrica',
	TH: 'SoutheastAsia',
	TJ: 'CentralAsia',
	TL: 'SoutheastAsia',
	TM: 'CentralAsia',
	TN: 'MiddleEast',
	TR: 'MiddleEast',
	TW: 'EastAsia',
	TZ: 'EastAfrica',
	UA: 'EasternEurope',
	UG: 'EastAfrica',
	US: 'NorthAmerica',
	UY: 'SouthAmerica',
	UZ: 'CentralAsia',
	VE: 'SouthAmerica',
	VN: 'SoutheastAsia',
	YE: 'MiddleEast',
	ZA: 'SouthernAfrica',
	ZM: 'SouthernAfrica',
	ZW: 'SouthernAfrica',
};

const visibleCountryFeaturesFilter = [
	'all',
	['==', ['get', 'disputed'], 'false'],
	['any', ['==', 'all', ['get', 'worldview']], ['in', 'US', ['get', 'worldview']]],
];

const MAP_VARIANT_CONFIG: Record<MapboxMapVariant, VariantConfig> = {
	main: {
		padding: 107,
		imageSize: 856,
		renderScale: 2,
		customStyleUrl: MAIN_MAP_CUSTOM_STYLE_URL,
		showSurroundingCountries: true,
		boundaryStyle: {
			fill: '#DCE5D4',
			fillOpacity: 1,
			outline: 'rgba(80,75,65,0.4)',
		},
		surroundingCountriesStyle: {
			fill: '#ddd8cc',
			fillOpacity: 0.55,
			outline: 'rgba(80,75,65,0.4)',
		},
	},
	inset: {
		padding: 48,
		imageSize: 512,
		renderScale: 1,
		customStyleUrl: INSET_MAP_CUSTOM_STYLE_URL,
		showSurroundingCountries: false,
		boundaryStyle: {
			fill: '#D25B4D',
			fillOpacity: 1,
			outline: '#C64A3A',
		},
	},
};

export const isMapboxMapVariant = (value: string): value is MapboxMapVariant => {
	return value === 'main' || value === 'inset';
};

export const getCountryStaticMapUrl = async ({
	accessToken,
	isoCode,
	variant = 'main',
}: CountryStaticMapUrlOptions): Promise<string | null> => {
	const normalizedIsoCode = normalizeIsoCode(isoCode);

	if (!normalizedIsoCode) {
		return null;
	}

	const countryMapData = await getCountryMapData(normalizedIsoCode, accessToken);

	if (!countryMapData) {
		return null;
	}

	return buildMapboxStaticImageUrl({
		accessToken,
		boundingBox: getViewportBoundingBox(countryMapData, variant),
		isoCode: countryMapData.isoCode,
		variant,
	});
};

const normalizeIsoCode = (isoCode: string): string | null => {
	const normalizedIsoCode = isoCode.trim().toUpperCase();

	return normalizedIsoCode.length > 0 ? normalizedIsoCode : null;
};

const getCountryMapData = async (isoCode: string, accessToken: string): Promise<CountryMapData | null> => {
	const geocodingFeature = await getGeocodingCountryFeature(isoCode, accessToken);

	if (!geocodingFeature?.geometry?.coordinates) {
		return null;
	}

	const matchedIsoCode = getMatchedIsoCode(geocodingFeature, isoCode);
	const boundingBox = toCountryBoundingBox(geocodingFeature.properties?.bbox);

	if (!matchedIsoCode || !boundingBox) {
		return null;
	}

	const center = geocodingFeature.geometry.coordinates;
	const region = await getCountryRegionByPoint({
		accessToken,
		center,
		isoCode: matchedIsoCode,
	});

	return {
		boundingBox,
		center,
		isoCode: matchedIsoCode,
		region,
		subregion: COUNTRY_SUBREGION_BY_ISO_CODE[matchedIsoCode] ?? null,
	};
};

const getViewportBoundingBox = (countryMapData: CountryMapData, variant: MapboxMapVariant): CountryBoundingBox => {
	if (variant === 'main') {
		return countryMapData.boundingBox;
	}

	if (countryMapData.subregion) {
		return SUBREGION_BOUNDING_BOXES[countryMapData.subregion];
	}

	return REGION_BOUNDING_BOXES[countryMapData.region ?? ''] ?? countryMapData.boundingBox;
};

const buildMapboxStaticImageUrl = ({
	accessToken,
	boundingBox,
	isoCode,
	variant,
}: {
	accessToken: string;
	boundingBox: CountryBoundingBox;
	isoCode: string;
	variant: MapboxMapVariant;
}): string => {
	const variantConfig = MAP_VARIANT_CONFIG[variant];
	const styleReference = getRequiredMapboxStyleReference(variantConfig.customStyleUrl);
	const viewport = `[${boundingBox.map((coordinate) => coordinate.toFixed(4)).join(',')}]`;
	const { renderScale } = variantConfig;
	// Mapbox multiplies the requested dimensions by the scale factor, so ask for
	// logical pixels here to end up at imageSize in the rendered image.
	const logicalSize = variantConfig.imageSize / renderScale;
	const scaleSuffix = renderScale === 2 ? '@2x' : '';
	const url = new URL(
		`https://api.mapbox.com/styles/v1/${styleReference.username}/${styleReference.styleId}/static/${viewport}/${logicalSize}x${logicalSize}${scaleSuffix}`,
	);

	url.searchParams.set('addlayer', JSON.stringify(buildCountryFillLayer(isoCode, variant, variantConfig)));
	// Keep the fill layer below labels so country and ocean names stay visible.
	url.searchParams.set('before_layer', MAPBOX_BOUNDARY_INSERT_BEFORE_LAYER);
	url.searchParams.set('padding', String(Math.round(variantConfig.padding / renderScale)));
	url.searchParams.set('logo', 'false');
	url.searchParams.set('attribution', 'false');
	url.searchParams.set('access_token', accessToken);

	return url.toString();
};

const getRequiredMapboxStyleReference = (customStyleUrl: string): MapboxStyleReference => {
	const styleReference = parseMapboxStyleUrl(customStyleUrl);

	if (!styleReference) {
		throw new Error(`Invalid Mapbox style URL: ${customStyleUrl}`);
	}

	return styleReference;
};

const parseMapboxStyleUrl = (customStyleUrl: string): MapboxStyleReference | null => {
	const match = /^mapbox:\/\/styles\/([^/]+)\/([^/?#]+)$/.exec(customStyleUrl.trim());

	if (!match) {
		return null;
	}

	const [, username, styleId] = match;

	return {
		styleId,
		username,
	};
};

const buildCountryFillLayer = (isoCode: string, variant: MapboxMapVariant, variantConfig: VariantConfig) => {
	return {
		id: `country-boundaries-${variant}-${isoCode.toLowerCase()}`,
		type: 'fill',
		source: {
			type: 'vector',
			url: MAPBOX_COUNTRY_BOUNDARIES_SOURCE_URL,
		},
		'source-layer': MAPBOX_COUNTRY_BOUNDARIES_SOURCE_LAYER,
		filter: buildVisibleCountryFeaturesFilter(isoCode, variantConfig.showSurroundingCountries),
		paint: buildCountryFillPaint(isoCode, variantConfig),
	};
};

const buildVisibleCountryFeaturesFilter = (isoCode: string, showSurroundingCountries: boolean) => {
	if (showSurroundingCountries) {
		// Filter out disputed and incompatible worldview polygons before applying paint.
		return visibleCountryFeaturesFilter;
	}

	return [...visibleCountryFeaturesFilter, ['==', ['get', 'iso_3166_1'], isoCode]];
};

const buildCountryFillPaint = (isoCode: string, variantConfig: VariantConfig) => {
	if (!variantConfig.showSurroundingCountries || !variantConfig.surroundingCountriesStyle) {
		return {
			'fill-color': variantConfig.boundaryStyle.fill,
			'fill-opacity': variantConfig.boundaryStyle.fillOpacity,
			'fill-outline-color': variantConfig.boundaryStyle.outline,
		};
	}

	return {
		'fill-color': [
			'match',
			['get', 'iso_3166_1'],
			isoCode,
			variantConfig.boundaryStyle.fill,
			variantConfig.surroundingCountriesStyle.fill,
		],
		'fill-opacity': [
			'match',
			['get', 'iso_3166_1'],
			isoCode,
			variantConfig.boundaryStyle.fillOpacity,
			variantConfig.surroundingCountriesStyle.fillOpacity,
		],
		'fill-outline-color': [
			'match',
			['get', 'iso_3166_1'],
			isoCode,
			variantConfig.boundaryStyle.outline,
			variantConfig.surroundingCountriesStyle.outline,
		],
	};
};

const getMatchedIsoCode = (feature: GeocodingCountryFeature, isoCode: string): string | null => {
	const normalizedIsoCode = normalizeIsoCode(isoCode);

	if (!normalizedIsoCode) {
		return null;
	}

	const countryContext = feature.properties?.context?.country;

	if (countryContext?.country_code?.toUpperCase() === normalizedIsoCode) {
		return countryContext.country_code.toUpperCase();
	}

	if (countryContext?.country_code_alpha_3?.toUpperCase() === normalizedIsoCode) {
		return countryContext.country_code?.toUpperCase() ?? null;
	}

	return null;
};

const getGeocodingCountryFeature = async (isoCode: string, accessToken: string): Promise<GeocodingCountryFeature | null> => {
	const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
	url.searchParams.set('q', isoCode);
	url.searchParams.set('types', 'country');
	url.searchParams.set('limit', '10');
	url.searchParams.set('access_token', accessToken);

	const response = await fetch(url, { next: { revalidate: MAPBOX_DATA_REVALIDATE_SECONDS } });

	if (!response.ok) {
		return null;
	}

	const data: unknown = await response.json();
	const features = getFeatures(data).map(toGeocodingCountryFeature).filter(isNonNullable);

	return features.find((feature) => getMatchedIsoCode(feature, isoCode) !== null) ?? null;
};

