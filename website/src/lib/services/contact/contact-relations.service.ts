import { CountryCode, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';

type ContactAddressFields = {
	street: string | null;
	number: string | null;
	city: string | null;
	zip: string | null;
	country: string | null;
};

type BuildPhoneWriteOperationParams = {
	nextPhoneNumber: string | undefined;
	nextHasWhatsApp: boolean;
	currentPhoneId: string | undefined;
	currentPhoneNumber: string | undefined;
};

type BuildAddressWriteOperationParams = {
	addressInput:
		| {
				street: string;
				number: string;
				city: string;
				zip: string;
				country: CountryCode | null;
		  }
		| undefined;
	currentAddressId: string | undefined;
};

export class ContactRelationsService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	getAddressInput(contact: ContactAddressFields) {
		const hasAddressValue = this.hasAddressInput(contact);
		if (!hasAddressValue) {
			return undefined;
		}

		return {
			street: contact.street ?? '',
			number: contact.number ?? '',
			city: contact.city ?? '',
			zip: contact.zip ?? '',
			country: this.toCountryCode(contact.country),
		};
	}

	hasAddressInput(contact: ContactAddressFields): boolean {
		return !!(contact.street || contact.number || contact.city || contact.zip || contact.country);
	}

	buildPhoneWriteOperation({
		nextPhoneNumber,
		nextHasWhatsApp,
		currentPhoneId,
		currentPhoneNumber,
	}: BuildPhoneWriteOperationParams): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined {
		if (nextPhoneNumber) {
			if (currentPhoneId && currentPhoneNumber === nextPhoneNumber) {
				return {
					update: {
						where: { id: currentPhoneId },
						data: {
							hasWhatsApp: nextHasWhatsApp,
						},
					},
				};
			}

			if (currentPhoneId) {
				return {
					connectOrCreate: {
						where: { number: nextPhoneNumber },
						create: {
							number: nextPhoneNumber,
							hasWhatsApp: nextHasWhatsApp,
						},
					},
				};
			}

			return {
				create: {
					number: nextPhoneNumber,
					hasWhatsApp: nextHasWhatsApp,
				},
			};
		}

		if (currentPhoneId) {
			return {
				disconnect: true,
			};
		}

		return undefined;
	}

	buildAddressWriteOperation({
		addressInput,
		currentAddressId,
	}: BuildAddressWriteOperationParams): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined {
		if (addressInput) {
			if (currentAddressId) {
				return {
					upsert: {
						where: { id: currentAddressId },
						update: addressInput,
						create: addressInput,
					},
				};
			}

			return {
				create: addressInput,
			};
		}

		if (currentAddressId) {
			return {
				disconnect: true,
			};
		}

		return undefined;
	}

	async deletePhoneIfUnused(phoneId: string): Promise<void> {
		const shouldDelete = await this.shouldDeletePhone(phoneId);
		if (!shouldDelete) {
			return;
		}

		await this.db.phone.delete({
			where: { id: phoneId },
		});
	}

	async deleteAddressIfUnused(addressId: string): Promise<void> {
		const address = await this.db.address.findUnique({
			where: { id: addressId },
			select: {
				_count: {
					select: {
						contacts: true,
					},
				},
			},
		});

		if (!address || address._count.contacts > 0) {
			return;
		}

		await this.db.address.delete({
			where: { id: addressId },
		});
	}

	async shouldDeletePhone(phoneId: string | null | undefined): Promise<boolean> {
		if (!phoneId) {
			return false;
		}

		const phone = await this.db.phone.findUnique({
			where: { id: phoneId },
			select: {
				_count: {
					select: {
						contacts: true,
						paymentInformations: true,
					},
				},
			},
		});

		if (!phone) {
			return false;
		}

		return phone._count.contacts <= 1 && phone._count.paymentInformations === 0;
	}

	private toCountryCode(country: string | null): CountryCode | null {
		if (!country) {
			return null;
		}
		if ((Object.values(CountryCode) as string[]).includes(country)) {
			return country as CountryCode;
		}
		return null;
	}
}
