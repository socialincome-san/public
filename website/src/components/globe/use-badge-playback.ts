'use client';

import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { getCountryCentroid } from '@/lib/types/country-centroids';
import { isValidCountryCode } from '@/lib/types/country';
import { logger } from '@/lib/utils/logger';
import { useEffect, useRef, type RefObject } from 'react';
import { MAX_BADGE_SLOTS, type GlobeRendererHandle } from './globe-renderer';

const VISIBILITY_THRESHOLD_DEG = 65;

/**
 * Converts lat/lng values from degrees to radians for angular distance computation.
 */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Returns the angular distance in degrees between two lat/lng points on a sphere.
 */
const angularDistanceDeg = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
	const cosDistance =
		Math.sin(toRad(lat1)) * Math.sin(toRad(lat2)) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
	return (Math.acos(Math.max(-1, Math.min(1, cosDistance))) * 180) / Math.PI;
};

/**
 * Returns a deterministic sub-country offset in degrees derived from the contribution key.
 * This avoids identical badges stacking when multiple contributions come from the same country.
 * The offset is small enough to stay within country boundaries for large countries.
 */
const deterministicOffset = (key: string): { lat: number; lng: number } => {
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (Math.imul(31, hash) + key.charCodeAt(i)) | 0;
	}
	const latOffset = ((hash & 0xff) / 255 - 0.5) * 2.0;
	const lngOffset = (((hash >> 8) & 0xff) / 255 - 0.5) * 3.0;
	return { lat: latOffset, lng: lngOffset };
};

type ActiveBadge = {
	key: string;
	slotIndex: number;
};

type ResolvedContribution = GlobeContribution & {
	lat: number;
	lng: number;
};

type Props = {
	contributions: GlobeContribution[];
	rendererRef: RefObject<GlobeRendererHandle | null>;
	reducedMotion: boolean;
};

const isContributionVisible = (
	pov: { lat: number; lng: number },
	candidate: ResolvedContribution,
): boolean => angularDistanceDeg(pov.lat, pov.lng, candidate.lat, candidate.lng) < VISIBILITY_THRESHOLD_DEG;

export const useBadgePlayback = ({ contributions, rendererRef, reducedMotion }: Props) => {
	const reducedMotionRef = useRef(reducedMotion);

	useEffect(() => {
		reducedMotionRef.current = reducedMotion;
	}, [reducedMotion]);

	useEffect(() => {
		const resolved: ResolvedContribution[] = [];
		let skipped = 0;

		for (const contribution of contributions) {
			if (!isValidCountryCode(contribution.countryCode)) {
				skipped++;
				continue;
			}
			const centroid = getCountryCentroid(contribution.countryCode);
			if (!centroid) {
				skipped++;
				continue;
			}
			const offset = deterministicOffset(contribution.key);
			resolved.push({
				...contribution,
				lat: centroid.lat + offset.lat,
				lng: centroid.lng + offset.lng,
			});
		}

		if (skipped > 0) {
			logger.warn(`useBadgePlayback: skipped ${skipped} contributions without a mapped centroid.`);
		}

		if (resolved.length === 0) {
			return;
		}

		const activeBadges: ActiveBadge[] = [];

		const findFreeSlotIndex = () => {
			const usedSlots = new Set(activeBadges.map((badge) => badge.slotIndex));
			for (let slotIndex = 0; slotIndex < MAX_BADGE_SLOTS; slotIndex++) {
				if (!usedSlots.has(slotIndex)) {
					return slotIndex;
				}
			}

			return -1;
		};

		const deactivateAllBadges = (renderer: GlobeRendererHandle) => {
			for (const badge of activeBadges) {
				renderer.deactivateBadgeSlot(badge.slotIndex);
			}
			activeBadges.length = 0;
		};

		const syncVisibleBadges = () => {
			const renderer = rendererRef.current;
			if (!renderer) {
				return;
			}

			if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
				deactivateAllBadges(renderer);
				return;
			}

			const pov = renderer.getPointOfView();
			const animate = !reducedMotionRef.current;

			for (let index = activeBadges.length - 1; index >= 0; index--) {
				const badge = activeBadges[index]!;
				const contribution = resolved.find((entry) => entry.key === badge.key);
				if (!contribution || !isContributionVisible(pov, contribution)) {
					renderer.deactivateBadgeSlot(badge.slotIndex);
					activeBadges.splice(index, 1);
				}
			}

			const visibleContributions = resolved
				.filter((candidate) => isContributionVisible(pov, candidate))
				.sort(
					(a, b) => new Date(b.contributedAt).getTime() - new Date(a.contributedAt).getTime(),
				);

			const activeKeys = new Set(activeBadges.map((badge) => badge.key));

			for (const candidate of visibleContributions) {
				if (activeBadges.length >= MAX_BADGE_SLOTS) {
					break;
				}

				if (activeKeys.has(candidate.key)) {
					continue;
				}

				const slotIndex = findFreeSlotIndex();
				if (slotIndex === -1) {
					break;
				}

				renderer.activateBadgeSlot(slotIndex, {
					lat: candidate.lat,
					lng: candidate.lng,
					contribution: candidate,
					animate,
				});
				activeBadges.push({ key: candidate.key, slotIndex });
				activeKeys.add(candidate.key);
			}
		};

		let frameId: number | null = null;
		const tick = () => {
			syncVisibleBadges();
			frameId = requestAnimationFrame(tick);
		};

		frameId = requestAnimationFrame(tick);

		return () => {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
			}
			const renderer = rendererRef.current;
			if (renderer) {
				deactivateAllBadges(renderer);
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contributions, reducedMotion]);
};
