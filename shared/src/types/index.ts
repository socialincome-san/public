export type EntityValues<M> = M;

export interface Entity<M> {
	/**
	 * ID of the entity
	 */
	id: string;
	/**
	 * A string representing the path of the referenced document (relative
	 * to the root of the database).
	 */
	path: string;
	/**
	 * Current values
	 */
	values: EntityValues<M>;
}

export * from './admin/AdminUser';
export * from './admin/BankBalance';
export * from './admin/Contribution';
export * from './admin/ContributorOrganisation';
export * from './admin/DonationCertificate';
export * from './admin/ExchangeRates';
export * from './admin/NewsletterSubscriber';
export * from './admin/OperationalExpense';
export * from './admin/OrangeMoneyRecipient';
export * from './admin/PartnerOrganisation';
export * from './admin/Payment';
export * from './admin/Recipient';
export * from './admin/User';
