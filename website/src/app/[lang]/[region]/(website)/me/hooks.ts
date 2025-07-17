import { UserContext } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { useApiClient } from '@/lib/api/useApiClient';
import { useFirestore } from '@/lib/firebase/hooks/useFirestore';
import { orderBy, Query, QuerySnapshot } from '@firebase/firestore';
import { CONTRIBUTION_FIRESTORE_PATH } from '@socialincome/shared/src/types/contribution';
import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '@socialincome/shared/src/types/donation-certificate';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query } from 'firebase/firestore';
import { useContext } from 'react';
import Stripe from 'stripe';

export const useUser = () => {
	const user = useContext(UserContext);
	if (!user) {
		return null;
	}
	return user;
};

export const useContributions = () => {
	const firestore = useFirestore();
	const user = useUser();

	const {
		data: contributions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['me', 'contributions'],
		queryFn: () => {
			if (!user) {
				throw new Error('User not authenticated');
			}
			return getDocs(
				query(
					collection(firestore, USER_FIRESTORE_PATH, user.id, CONTRIBUTION_FIRESTORE_PATH),
					orderBy('created', 'desc'),
				),
			);
		},
		enabled: !!user,
	});
	return { contributions, isLoading, error };
};

export const useSubscriptions = () => {
	const api = useApiClient();
	const {
		data: subscriptions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['me', 'subscriptions'],
		queryFn: async () => {
			const response = await api.get('/api/stripe/subscriptions');
			return (await response.json()) as Stripe.Subscription[];
		},
	});
	return { subscriptions, isLoading, error };
};

export const useDonationCertificates = (): {
	donationCertificates: QuerySnapshot<DonationCertificate> | undefined;
	isLoading: boolean;
	error: Error | null;
} => {
	const firestore = useFirestore();
	const user = useUser();

	const {
		data: donationCertificates,
		isLoading,
		error,
	} = useQuery<QuerySnapshot<DonationCertificate>>({
		queryKey: ['me', 'donation-certificates'],
		queryFn: () => {
			if (!user) {
				throw new Error('User not authenticated');
			}
			return getDocs(
				query(
					collection(firestore, user.ref.path, DONATION_CERTIFICATE_FIRESTORE_PATH),
					orderBy('year', 'desc'),
				) as Query<DonationCertificate>,
			);
		},
		enabled: !!user,
	});
	return { donationCertificates, isLoading, error };
};

export const useNewsletterSubscription = () => {
	const api = useApiClient();
	const {
		data: status,
		isLoading,
		error,
	} = useQuery<string | null>({
		queryKey: ['me', 'newsletter'],
		queryFn: async () => {
			const response = await api.get('/api/newsletter/subscription');
			const responseData = await response.json();
			if (responseData === null || !responseData.status) {
				return 'unsubscribed';
			} else {
				return responseData.status;
			}
		},
	});
	return { status, isLoading, error };
};

export const useUpsertNewsletterSubscription = () => {
	const api = useApiClient();
	const queryClient = useQueryClient();

	return async (status: 'subscribed' | 'unsubscribed') => {
		const response = await api.post('/api/newsletter/subscription', { status });
		await queryClient.invalidateQueries({ queryKey: ['me', 'newsletter'] });
		return response;
	};
};
