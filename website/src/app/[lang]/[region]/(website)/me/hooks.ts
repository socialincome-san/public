import { UserContext } from '@/components/providers/user-context-provider';
import { useApi } from '@/hooks/useApi';
import { orderBy } from '@firebase/firestore';
import { Status } from '@mailchimp/mailchimp_marketing';
import { CONTRIBUTION_FIRESTORE_PATH, StatusKey } from '@socialincome/shared/src/types/contribution';
import { DONATION_CERTIFICATE_FIRESTORE_PATH } from '@socialincome/shared/src/types/donation-certificate';
import { EMPLOYERS_FIRESTORE_PATH, Employer } from '@socialincome/shared/src/types/employers';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
		isRefetching,
		error,
	} = useQuery({
		queryKey: ['me', 'contributions'],
		queryFn: () =>
			getDocs(
				query(
					collection(firestore, USER_FIRESTORE_PATH, user.id, CONTRIBUTION_FIRESTORE_PATH),
					where('status', '==', StatusKey.SUCCEEDED),
					orderBy('created', 'desc'),
				),
			),
		staleTime: 3600000, // 1 hour
	});
	return { contributions, loading: isLoading || isRefetching, error };
};

export const useSubscriptions = () => {
	const api = useApi();
	const {
		data: subscriptions,
		isLoading,
		isRefetching,
		error,
	} = useQuery({
		queryKey: ['me', 'subscriptions'],
		queryFn: async () => {
			const response = await api.get('/api/stripe/subscriptions');
			return (await response.json()) as Stripe.Subscription[];
		},
		staleTime: 3600000, // 1 hour
	});
	return { subscriptions, loading: isLoading || isRefetching, error };
};

export const useDonationCertificates = () => {
	const firestore = useFirestore();
	const user = useUser();
	const {
		data: donationCertificates,
		isLoading,
		isRefetching,
		error,
	} = useQuery({
		queryKey: ['me', 'donation-certificates'],
		queryFn: () =>
			getDocs(
				query(
					collection(firestore, USER_FIRESTORE_PATH, user.id, DONATION_CERTIFICATE_FIRESTORE_PATH),
					orderBy('year', 'desc'),
				),
			),
		staleTime: 3600000, // 1 hour
	});
	return { donationCertificates, loading: isLoading || isRefetching, error };
};

export const useNewsletterSubscription = () => {
	const api = useApi();
	const {
		data: status,
		isLoading,
		isRefetching,
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
		staleTime: 3600000, // 1 hour
	});
	return { status, loading: isLoading || isRefetching, error };
};

export const useUpsertNewsletterSubscription = () => {
	const api = useApi();
	const queryClient = useQueryClient();

	return async (status: Status) => {
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
		isRefetching,
		error,
	} = useQuery({
		queryKey: ['me', 'employers'],
		queryFn: async () => {
			const data = await getDocs(
				query(collection(firestore, USER_FIRESTORE_PATH, user.id, 'employers'), orderBy('created', 'desc')),
			);
			return data.docs.map((e) => ({ id: e.id, ...e.data() }) as EmployerWithId);
		},
		staleTime: 3600000, // 1 hour
	});
	return { employers, loading: isLoading || isRefetching, error };
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
