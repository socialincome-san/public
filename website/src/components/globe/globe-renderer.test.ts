import { AUTO_ROTATE_SPEED, DAMPING_FACTOR } from './globe-config';
import { configureGlobeControls, type GlobeControlsConfig } from './globe-renderer';

const createControls = (): GlobeControlsConfig => ({
	autoRotate: true,
	autoRotateSpeed: 0,
	dampingFactor: 0,
	enableDamping: false,
	enablePan: true,
	enableRotate: false,
	enableZoom: true,
	maxDistance: Infinity,
	maxPolarAngle: Infinity,
	minDistance: 0,
	minPolarAngle: 0,
	getDistance: () => 172,
	getPolarAngle: () => 1.2,
	update: jest.fn(),
});

describe('configureGlobeControls', () => {
	it('locks tilt and zoom while keeping horizontal auto-rotation', () => {
		const controls = createControls();

		configureGlobeControls(controls, false);

		expect(controls.autoRotate).toBe(true);
		expect(controls.autoRotateSpeed).toBe(AUTO_ROTATE_SPEED);
		expect(controls.enableDamping).toBe(true);
		expect(controls.dampingFactor).toBe(DAMPING_FACTOR);
		expect(controls.enableZoom).toBe(false);
		expect(controls.enablePan).toBe(false);
		expect(controls.enableRotate).toBe(true);
		expect(controls.minPolarAngle).toBe(1.2);
		expect(controls.maxPolarAngle).toBe(1.2);
		expect(controls.minDistance).toBe(172);
		expect(controls.maxDistance).toBe(172);
	});

	it('disables auto-rotation for reduced motion', () => {
		const controls = createControls();

		configureGlobeControls(controls, true);

		expect(controls.autoRotate).toBe(false);
	});
});
