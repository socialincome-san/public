import { Phone, WhatsAppActivationStatus } from '@prisma/client';

export const phonesData: Phone[] = [
	{
		id: 'phone-1',
		type: 'primary',
		number: '+41791234567',
		verified: true,
		whatsAppActivationStatus: WhatsAppActivationStatus.verified,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'phone-2',
		type: 'primary',
		number: '+41761234567',
		verified: false,
		whatsAppActivationStatus: WhatsAppActivationStatus.pending,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'phone-3',
		type: 'primary',
		number: '+41751234567',
		verified: true,
		whatsAppActivationStatus: WhatsAppActivationStatus.disabled,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'phone-4',
		type: 'primary',
		number: '+23276123456',
		verified: true,
		whatsAppActivationStatus: WhatsAppActivationStatus.verified,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'phone-5',
		type: 'primary',
		number: '+23277111222',
		verified: false,
		whatsAppActivationStatus: WhatsAppActivationStatus.pending,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'phone-6',
		type: 'primary',
		number: '+23288765432',
		verified: true,
		whatsAppActivationStatus: WhatsAppActivationStatus.disabled,
		createdAt: new Date(),
		updatedAt: null
	}
];