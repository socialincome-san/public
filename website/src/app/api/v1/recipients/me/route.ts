import { withAppCheck } from '@/lib/firebase/with-app-check';
import { services } from '@/lib/services/services';
import { RecipientPrismaUpdateInput } from '@/lib/services/recipient/recipient.types';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { RecipientSelfUpdate } from '../../models';

/**
 * Get recipient
 * @description Returns the authenticated recipient with all related data. Requires a valid Firebase App Check token.
 * @response 200:Recipient
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	
	const recipientResult = await services.recipient.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		logger.warn('[GET /recipients/me] Failed', {
			error: recipientResult.error,
			status: recipientResult.status,
		});

		return new Response(recipientResult.error, {
			status: recipientResult.status ?? 500,
		});
	}

	return NextResponse.json(recipientResult.data, { status: 200 });
});

/**
 * Update recipient
 * @description Updates the authenticated recipient’s personal information, contact details, and mobile money payment information. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @body RecipientSelfUpdate
 * @response 200:Recipient
 * @openapi
 */
export const PATCH = withAppCheck(async (request: NextRequest) => {
	

	logger.info('[PATCH /recipients/me] Incoming request', {
		contentType: request.headers.get('content-type'),
	});

	const recipientResult = await services.recipient.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		logger.warn('[PATCH /recipients/me] Recipient resolution failed', {
			error: recipientResult.error,
			status: recipientResult.status,
		});

		return new Response(recipientResult.error, {
			status: recipientResult.status ?? 500,
		});
	}

	const recipient = recipientResult.data;

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		logger.warn('[PATCH /recipients/me] Invalid JSON body');
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = RecipientSelfUpdate.safeParse(body);

	if (!parsed.success) {
		logger.warn('[PATCH /recipients/me] Validation failed', {
			zodErrors: parsed.error.format(),
		});

		return new Response(parsed.error.message, { status: 400 });
	}

	const data = parsed.data;

	const oldPaymentPhone = recipient.paymentInformation?.phone?.number ?? null;
	const newPaymentPhone = data.paymentPhone ?? null;

	logger.info('[PATCH /recipients/me] Phone update intent', {
		oldPaymentPhone,
		newPaymentPhone,
		contactPhone: data.contactPhone === null ? null : typeof data.contactPhone === 'string' ? 'provided' : 'unchanged',
	});

	const updateData: RecipientPrismaUpdateInput = {
		contact: {
			update: {
				firstName: data.firstName,
				lastName: data.lastName,
				callingName: data.callingName,
				gender: data.gender,
				dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
				language: data.language,
				email: data.email,
				phone:
					data.contactPhone === null
						? { disconnect: true }
						: typeof data.contactPhone === 'string'
							? {
									connectOrCreate: {
										where: { number: data.contactPhone },
										create: { number: data.contactPhone },
									},
								}
							: undefined,
			},
		},

		successorName: data.successorName,
		termsAccepted: data.termsAccepted,

		paymentInformation:
			data.paymentPhone || data.paymentProvider
				? {
						upsert: {
							update: {
								provider: data.paymentProvider,
								phone: data.paymentPhone
									? {
											connectOrCreate: {
												where: { number: data.paymentPhone },
												create: { number: data.paymentPhone },
											},
										}
									: undefined,
							},
							create: {
								provider: data.paymentProvider!,
								code: recipient.paymentInformation?.code ?? '',
								phone: {
									connectOrCreate: {
										where: { number: data.paymentPhone! },
										create: { number: data.paymentPhone! },
									},
								},
							},
						},
					}
				: undefined,
	};

	const updateResult = await services.recipient.updateSelf(recipient.id, updateData, {
		oldPaymentPhone,
		newPaymentPhone,
	});

	if (!updateResult.success) {
		logger.error('[PATCH /recipients/me] Update failed', {
			error: updateResult.error,
		});

		return new Response(updateResult.error, { status: 500 });
	}

	logger.info('[PATCH /recipients/me] Update successful', {
		recipientId: recipient.id,
	});

	return NextResponse.json(updateResult.data, { status: 200 });
});
