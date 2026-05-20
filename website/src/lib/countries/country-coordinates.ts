export type CountryCoordinate = {
	name: string;
	lat: number;
	lng: number;
};

export const countryCoordinates: Record<string, CountryCoordinate> = {
	CH: { name: 'Switzerland', lat: 46.8182, lng: 8.2275 },
	DE: { name: 'Germany', lat: 51.1657, lng: 10.4515 },
	US: { name: 'United States', lat: 38.9072, lng: -77.0369 },
	GB: { name: 'United Kingdom', lat: 55.3781, lng: -3.436 },
	FR: { name: 'France', lat: 46.2276, lng: 2.2137 },
	CA: { name: 'Canada', lat: 56.1304, lng: -106.3468 },
	SL: { name: 'Sierra Leone', lat: 8.4606, lng: -11.7799 },
	LR: { name: 'Liberia', lat: 6.4281, lng: -9.4295 },
	GH: { name: 'Ghana', lat: 7.9465, lng: -1.0232 },
	DZ: { name: 'Algeria', lat: 28.0339, lng: 1.6596 },
	AO: { name: 'Angola', lat: -11.2027, lng: 17.8739 },
	BF: { name: 'Burkina Faso', lat: 12.2383, lng: -1.5616 },
	TZ: { name: 'Tanzania', lat: -6.369, lng: 34.8888 },
	ET: { name: 'Ethiopia', lat: 9.145, lng: 40.4897 },
	KE: { name: 'Kenya', lat: -0.0236, lng: 37.9062 },
	MW: { name: 'Malawi', lat: -13.2543, lng: 34.3015 },
};

export const getCountryCoordinate = (code: string): CountryCoordinate | null => countryCoordinates[code] ?? null;
