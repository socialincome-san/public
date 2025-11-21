import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { RecipientPrismaUpdateInput } from '@/lib/services/recipient/recipient.types';
import { NextResponse } from 'next/server';
import { RecipientSelfUpdate } from '../../models';

/**
 * Get recipient
 * @description Returns the authenticated recipient with all related data.
 * @response Recipient
 * @openapi
 */
export async function GET(request: Request) {
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	return NextResponse.json(recipientResult.data, { status: 200 });
}

/**
 * Update recipient
 * @description Updates the authenticated recipient’s personal information, contact details, and mobile money payment information.
 * @auth BearerAuth
 * @body RecipientSelfUpdate
 * @response Recipient
 * @openapi
 */
export async function PATCH(request: Request) {
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = RecipientSelfUpdate.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.errors[0]?.message ?? 'Invalid input', { status: 400 });
	}

	const recipient = recipientResult.data;
	const data = parsed.data;

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
				phone: data.contactPhone
					? {
							upsert: {
								update: { number: data.contactPhone },
								create: { number: data.contactPhone },
							},
						}
					: undefined,
			},
		},

		successorName: data.successorName,

		paymentInformation:
			data.paymentPhone || data.paymentProvider
				? {
						upsert: {
							update: {
								provider: data.paymentProvider,
								phone: data.paymentPhone
									? {
											upsert: {
												update: { number: data.paymentPhone },
												create: { number: data.paymentPhone },
											},
										}
									: undefined,
							},
							create: {
								provider: data.paymentProvider!,
								code: recipient.paymentInformation?.code ?? '',
								phone: {
									create: { number: data.paymentPhone! },
								},
							},
						},
					}
				: undefined,
	};

	const updateResult = await recipientService.updateSelf(recipient.id, updateData);

	if (!updateResult.success) {
		return new Response(updateResult.error, { status: 500 });
	}

	return NextResponse.json(updateResult.data, { status: 200 });
}
