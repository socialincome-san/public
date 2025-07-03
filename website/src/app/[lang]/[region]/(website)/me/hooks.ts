import { UserContext } from '@/components/providers/user-context-provider';
import { useApi } from '@/hooks/useApi';
import { orderBy, Query, QuerySnapshot } from '@firebase/firestore';
import { CONTRIBUTION_FIRESTORE_PATH } from '@socialincome/shared/src/types/contribution';
import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '@socialincome/shared/src/types/donation-certificate';
import { Employer, EMPLOYERS_FIRESTORE_PATH } from '@socialincome/shared/src/types/employers';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { useFirestore } from 'reactfire';
import Stripe from 'stripe';

export const useUser = () => {
	const user = useContext(UserContext);
	if (!user) {
		throw new Error('useUserContext must be used within a UserContextProvider');
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
		queryFn: () =>
			getDocs(
				query(
					collection(firestore, USER_FIRESTORE_PATH, user.id, CONTRIBUTION_FIRESTORE_PATH),
					orderBy('created', 'desc'),
				),
			),
	});
	return { contributions, isLoading, error };
};

export const useSubscriptions = () => {
	const api = useApi();
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
		queryFn: () =>
			getDocs(
				query(
					collection(firestore, user.ref.path, DONATION_CERTIFICATE_FIRESTORE_PATH),
					orderBy('year', 'desc'),
				) as Query<DonationCertificate>,
			),
	});
	return { donationCertificates, isLoading, error };
};

export const useNewsletterSubscription = () => {
	const api = useApi();
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
	const api = useApi();
	const queryClient = useQueryClient();

	return async (status: 'subscribed' | 'unsubscribed') => {
		const response = await api.post('/api/newsletter/subscription', { status });
		await queryClient.invalidateQueries({ queryKey: ['me', 'newsletter'] });
		return response;
	};
};

export type EmployerWithId = {
	id: string;
} & Employer;

export const useEmployers = () => {
	const firestore = useFirestore();
	const user = useUser();

	const {
		data: employers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['me', 'employers'],
		queryFn: async () => {
			const data = await getDocs(
				query(collection(firestore, USER_FIRESTORE_PATH, user.id, 'employers'), orderBy('created', 'desc')),
			);
			return data.docs.map((e) => ({ id: e.id, ...e.data() }) as EmployerWithId);
		},
	});
	return { employers, isLoading, error };
};

export const useArchiveEmployer = () => {
	const firestore = useFirestore();
	const user = useUser();
	const queryClient = useQueryClient();

	return async (employer_id: string) => {
		const employerRef = doc(firestore, USER_FIRESTORE_PATH, user!.id, 'employers', employer_id);
		await updateDoc(employerRef, { is_current: false });
		await queryClient.invalidateQueries({ queryKey: ['me', 'employers'] });
	};
};

export const useDeleteEmployer = () => {
	const firestore = useFirestore();
	const user = useUser();
	const queryClient = useQueryClient();

	return async (employer_id: string) => {
		const employerRef = doc(firestore, USER_FIRESTORE_PATH, user!.id, 'employers', employer_id);
		await deleteDoc(employerRef);
		await queryClient.invalidateQueries({ queryKey: ['me', 'employers'] });
	};
};

export const useAddEmployer = () => {
	const firestore = useFirestore();
	const user = useUser();
	const queryClient = useQueryClient();

	return async (employer_name: string) => {
		await addDoc(collection(firestore, USER_FIRESTORE_PATH, user.id, EMPLOYERS_FIRESTORE_PATH), {
			employer_name: employer_name,
			is_current: true,
			created: Timestamp.now(),
		});
		await queryClient.invalidateQueries({ queryKey: ['me', 'employers'] });
	};
};
