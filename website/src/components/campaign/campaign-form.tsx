'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useTranslator } from '@/hooks/useTranslator';
import { DocumentData } from '@firebase/firestore';
import { CAMPAIGN_FIRESTORE_PATH, CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { Alert, Button } from '@socialincome/ui';
import { useMutation } from '@tanstack/react-query';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import { z } from 'zod';

export function CampaignForm({ lang }: DefaultParams) {
	const translator = useTranslator(lang, 'website-campaign');
	const firestore = useFirestore();

	const mutation = useMutation({
		mutationFn: async (campaign: typeof testCampaignObject) => {
			const validatedCampaign = campaignSchema.parse(campaign);
			const doc = await addDoc(collection(firestore, CAMPAIGN_FIRESTORE_PATH), validatedCampaign as DocumentData);
			console.log(doc.id);
		},
	});

	if (!translator) return <></>;

	if (mutation.isSuccess) return <Alert variant="primary">{translator.t('campaign-form.created')}</Alert>;

	return (
		<>
			<Button
				disabled={mutation.isPending}
				showLoadingSpinner={mutation.isPending}
				onClick={() => mutation.mutate(testCampaignObject)}
			>
				{translator.t('campaign-form.submit')}
			</Button>
		</>
	);
}

const campaignSchema = z.object({
	creator_name: z.string().min(1, 'Creator name is required'),
	email: z.string().email('Invalid email address'),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	second_description_title: z.string().optional(),
	second_description: z.string().optional(),
	third_description_title: z.string().optional(),
	third_description: z.string().optional(),
	link_website: z.string().url('Invalid website URL').optional(),
	link_instagram: z.string().url('Invalid Instagram URL').optional(),
	amount_collected_chf: z.number().default(0),
	contributions: z.number().default(0),
	goal: z.number().optional(),
	goal_currency: z.string().optional(),
	end_date: z.date(),
	status: z.nativeEnum(CampaignStatus, { errorMap: () => ({ message: 'Invalid status' }) }),
	public: z.boolean().optional(),
});

const testCampaignObject = {
	creator_name: 'John Doe',
	email: 'john.doe@example.com',
	title: 'Wedding',
	description: 'Instead of gifts, please donate',
	link_website: 'https://www.example.com',
	link_instagram: 'https://www.instagram.com/example',
	amount_collected_chf: 0,
	contributions: 0,
	goal: 10000,
	goal_currency: 'CHF',
	end_date: new Date('2024-12-31'),
	status: 'active',
	public: true,
};
