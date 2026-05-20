import type { GlobeInstance } from '@/components/donation-globe/types';
import * as THREE from 'three';

const TUBULAR_SEGMENTS = 50;
const RADIAL_SEGMENTS = 6;
const TUBE_RADIUS = 0.4;

export type Comet = {
	mesh: THREE.Mesh;
	startTime: number;
	radialSegments: number;
	dispose: () => void;
};

export const createComet = (
	globe: GlobeInstance,
	startLat: number,
	startLng: number,
	endLat: number,
	endLng: number,
	colorHex: string,
	startTime: number = performance.now(),
): Comet => {
	const start = globe.getCoords(startLat, startLng, 0.01);
	const end = globe.getCoords(endLat, endLng, 0.01);
	const midLat = (startLat + endLat) / 2;
	const midLng = (startLng + endLng) / 2;
	const mid = globe.getCoords(midLat, midLng, 0.4);

	const curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3(start.x, start.y, start.z),
		new THREE.Vector3(mid.x, mid.y, mid.z),
		new THREE.Vector3(end.x, end.y, end.z),
	);

	const geometry = new THREE.TubeGeometry(curve, TUBULAR_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false);
	const material = new THREE.MeshBasicMaterial({
		color: new THREE.Color(colorHex),
		transparent: true,
		opacity: 0.95,
	});
	const mesh = new THREE.Mesh(geometry, material);
	mesh.geometry.setDrawRange(0, 0);
	globe.scene().add(mesh);

	return {
		mesh,
		startTime,
		radialSegments: RADIAL_SEGMENTS,
		dispose: () => {
			globe.scene().remove(mesh);
			geometry.dispose();
			material.dispose();
		},
	};
};

export const COMET_DURATION_MS = 1200;
export const COMET_TRAIL_LENGTH = 15;
export const COMET_TOTAL_SEGMENTS = TUBULAR_SEGMENTS;

export const updateComets = (comets: Comet[], now: number): Comet[] => {
	const remaining: Comet[] = [];

	for (const comet of comets) {
		const progress = (now - comet.startTime) / COMET_DURATION_MS;

		if (progress > 1.3) {
			comet.dispose();
			continue;
		}

		const head = Math.floor(progress * COMET_TOTAL_SEGMENTS);
		const tail = Math.max(0, head - COMET_TRAIL_LENGTH);
		const count = Math.max(0, head - tail);
		const indexStart = tail * comet.radialSegments * 6;
		const indexCount = count * comet.radialSegments * 6;
		comet.mesh.geometry.setDrawRange(indexStart, indexCount);
		remaining.push(comet);
	}

	return remaining;
};
