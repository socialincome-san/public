import { Recipient, RecipientStatus } from '@prisma/client';

export const recipientsData: Recipient[] = [
	{
		id: 'recipient-1',
		userAccountId: 'user-account-1',
		contactId: 'contact-4',
		startDate: new Date('2024-01-01'),
		status: RecipientStatus.active,
		successorName: null,
		termsAccepted: true,
		paymentInformationId: 'payment-information-1',
		programId: 'program-1',
		localPartnerId: 'local-partner-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'recipient-2',
		userAccountId: 'user-account-2',
		contactId: 'contact-5',
		startDate: new Date('2024-02-01'),
		status: RecipientStatus.active,
		successorName: null,
		termsAccepted: true,
		paymentInformationId: 'payment-information-2',
		programId: 'program-2',
		localPartnerId: 'local-partner-2',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'recipient-3',
		userAccountId: 'user-account-3',
		contactId: 'contact-6',
		startDate: new Date('2024-03-01'),
		status: RecipientStatus.waitlisted,
		successorName: null,
		termsAccepted: false,
		paymentInformationId: 'payment-information-3',
		programId: 'program-3',
		localPartnerId: 'local-partner-3',
		createdAt: new Date(),
		updatedAt: null
	}
];