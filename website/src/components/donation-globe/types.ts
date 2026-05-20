import type { Scene } from 'three';

export type DonationFlow = {
	id: string;
	amount: number;
	amountChf: number;
	currency: string;
	createdAt: string;
	fromCountryCode: string;
	fromCountryName: string;
	fromLat: number;
	fromLng: number;
	toCountryCode: string;
	toCountryName: string;
	toLat: number;
	toLng: number;
	label: string;
};

export type DonationGlobeStats = {
	count: number;
	totalAmountChf: number;
	periodStart: string;
	periodEnd: string;
};

export type PlaybackTimelineUpdate = {
	/** 0–1 position on the 12-month data window (10s playback). */
	progress: number;
	currentMonthLabel: string;
};

export type TimelineMonthMarker = {
	label: string;
	/** 0–1 along the full period. */
	offset: number;
};

export type GlobePoint = {
	lat: number;
	lng: number;
	name: string;
};

export type GlobeHtmlElement = {
	lat: number;
	lng: number;
	text: string;
	id: string;
};

export type GlobeCoords = {
	x: number;
	y: number;
	z: number;
};

export type GlobeControls = {
	autoRotate: boolean;
	autoRotateSpeed: number;
	enableZoom: boolean;
	enableDamping: boolean;
	dampingFactor: number;
};

export type GlobeInstance = {
	(element: HTMLElement): GlobeInstance;
	backgroundColor: (color: string) => GlobeInstance;
	showAtmosphere: (show: boolean) => GlobeInstance;
	globeMaterial: (material: unknown) => GlobeInstance;
	hexPolygonsData: (data: unknown[]) => GlobeInstance;
	hexPolygonResolution: (resolution: number) => GlobeInstance;
	hexPolygonMargin: (margin: number) => GlobeInstance;
	hexPolygonColor: (fn: () => string) => GlobeInstance;
	pointsData: (data: GlobePoint[]) => GlobeInstance;
	pointColor: (fn: () => string) => GlobeInstance;
	pointAltitude: (altitude: number) => GlobeInstance;
	pointRadius: (radius: number) => GlobeInstance;
	ringsData: (data: GlobePoint[]) => GlobeInstance;
	ringColor: (fn: () => string) => GlobeInstance;
	ringMaxRadius: (radius: number) => GlobeInstance;
	ringPropagationSpeed: (speed: number) => GlobeInstance;
	ringRepeatPeriod: (period: number) => GlobeInstance;
	htmlElement: (fn: (d: GlobeHtmlElement) => HTMLElement) => GlobeInstance;
	htmlElementsData: (data: GlobeHtmlElement[]) => GlobeInstance;
	htmlAltitude: (altitude: number) => GlobeInstance;
	pointOfView: (pov: { lat: number; lng: number; altitude: number }, transitionMs?: number) => GlobeInstance;
	controls: () => GlobeControls;
	scene: () => Scene;
	getCoords: (lat: number, lng: number, altitude: number) => GlobeCoords;
	width: (width: number) => GlobeInstance;
	height: (height: number) => GlobeInstance;
	_destructor?: () => void;
};
