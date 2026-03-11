import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CandidateFormCreateInput,
	CandidateFormUpdateInput,
	candidateCreateInputSchema,
	candidateUpdateInputSchema,
} from './candidate-form-input';

type CandidateUpdateUniquenessContext = {
	existingContactId: string;
	existingEmail: string | null;
	existingContactPhoneId: string | null;
	existingContactPhoneNumber: string | null;
	existingPaymentInformationId: string | null;
	existingPaymentCode: string | null;
	existingPaymentPhoneId: string | null;
	existingPaymentPhoneNumber: string | null;
};

export class CandidateValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: CandidateFormCreateInput): ServiceResult<CandidateFormCreateInput> {
		const parsedInput = candidateCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: CandidateFormUpdateInput): ServiceResult<CandidateFormUpdateInput> {
		const parsedInput = candidateUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: CandidateFormCreateInput): Promise<ServiceResult<void>> {
		if (
			input.contact.phone &&
			input.paymentInformation.phone &&
			input.contact.phone === input.paymentInformation.phone
		) {
			return this.resultFail('Contact phone and payment phone must be different.');
		}

		if (input.contact.email) {
			const emailConflict = await this.db.contact.findUnique({
				where: { email: input.contact.email },
				select: { id: true },
			});
			if (emailConflict) {
				return this.resultFail('A contact with this email already exists.');
			}
		}

		if (input.contact.phone) {
			const phoneConflict = await this.db.phone.findUnique({
				where: { number: input.contact.phone },
				select: { id: true },
			});
			if (phoneConflict) {
				return this.resultFail('A contact with this phone number already exists.');
			}
		}

		if (input.paymentInformation.phone) {
			const paymentPhoneConflict = await this.db.phone.findUnique({
				where: { number: input.paymentInformation.phone },
				select: { id: true },
			});
			if (paymentPhoneConflict) {
				return this.resultFail('A payment phone number with this value already exists.');
			}
		}

		if (input.paymentInformation.code) {
			const paymentCodeConflict = await this.db.paymentInformation.findUnique({
				where: { code: input.paymentInformation.code },
				select: { id: true },
			});
			if (paymentCodeConflict) {
				return this.resultFail('A payment code with this value already exists.');
			}
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: CandidateFormUpdateInput,
		context: CandidateUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (
			input.contact.phone &&
			input.paymentInformation.phone &&
			input.contact.phone === input.paymentInformation.phone
		) {
			return this.resultFail('Contact phone and payment phone must be different.');
		}

		if (input.contact.email && input.contact.email !== context.existingEmail) {
			const emailConflict = await this.db.contact.findUnique({
				where: { email: input.contact.email },
				select: { id: true },
			});
			if (emailConflict && emailConflict.id !== context.existingContactId) {
				return this.resultFail('A contact with this email already exists.');
			}
		}

		const newContactPhone = input.contact.phone ?? null;
		if (newContactPhone && newContactPhone !== context.existingContactPhoneNumber) {
			const phoneConflict = await this.db.phone.findUnique({
				where: { number: newContactPhone },
				select: { id: true },
			});
			if (phoneConflict && phoneConflict.id !== context.existingContactPhoneId) {
				return this.resultFail('A contact with this phone number already exists.');
			}
		}

		const newPaymentPhone = input.paymentInformation.phone ?? null;
		if (newPaymentPhone && newPaymentPhone !== context.existingPaymentPhoneNumber) {
			const paymentPhoneConflict = await this.db.phone.findUnique({
				where: { number: newPaymentPhone },
				select: { id: true },
			});
			if (paymentPhoneConflict && paymentPhoneConflict.id !== context.existingPaymentPhoneId) {
				return this.resultFail('A payment phone number with this value already exists.');
			}
		}

		if (input.paymentInformation.code && input.paymentInformation.code !== context.existingPaymentCode) {
			const paymentCodeConflict = await this.db.paymentInformation.findUnique({
				where: { code: input.paymentInformation.code },
				select: { id: true },
			});
			if (paymentCodeConflict && paymentCodeConflict.id !== context.existingPaymentInformationId) {
				return this.resultFail('A payment code with this value already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}
