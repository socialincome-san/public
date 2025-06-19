import { firestoreAdmin } from '@/firebase-admin';
import { BankTransferService } from '@socialincome/shared/src/bank-transfer/BankTransferService';
import { Currency } from '@socialincome/shared/src/types/currency';
import { NextResponse } from 'next/server';

export type SubmitBankTransferRequest = {
	user: {
		email: string;
		firstName: string;
		lastName: string;
		paymentReferenceId: number;
	};
	firebaseAuthToken: string;
	payment: {
		amount: number;
		intervalCount: number;
		currency: Currency;
		recurring: boolean;
	};
};

export async function POST(request: Request) {
	const { user: userData, payment } = (await request.json()) as SubmitBankTransferRequest;

	const bankTransferService = new BankTransferService(firestoreAdmin);

	try {
		await bankTransferService.storeCharge(payment, userData);
	} catch (error) {
		return NextResponse.json({ message: 'Payment failed' }, { status: 500 });
	}

	return NextResponse.json({ message: 'Payment confirmed' });
}
