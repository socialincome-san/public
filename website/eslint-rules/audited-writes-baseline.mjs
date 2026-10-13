// Models whose every write must produce an audit event, in any file.
export const auditedModels = ['recipient', 'paymentInformation'];

// Repositories written before audit logging. Their writes are not audited
// yet. Migrate a module to withAudit and remove it here; never add to this
// list. audited-writes-baseline.test.mjs fails when an entry is stale.
export const unauditedLegacyRepositories = [
	'src/modules/bank-accounts/bank-account.repository.ts',
	'src/modules/campaigns/campaign.repository.ts',
	'src/modules/contributions/contribution.repository.ts',
	'src/modules/contributors/contributor.repository.ts',
	'src/modules/countries/country.repository.ts',
	'src/modules/donation-certificates/donation-certificate.repository.ts',
	'src/modules/exchange-rates/exchange-rate.repository.ts',
	'src/modules/expenses/expense.repository.ts',
	'src/modules/focuses/focus.repository.ts',
	'src/modules/local-partners/local-partner.repository.ts',
	'src/modules/mail/mail.repository.ts',
	'src/modules/messaging/messaging.repository.ts',
	'src/modules/mobile-money-providers/mobile-money-provider.repository.ts',
	'src/modules/organizations/organization.repository.ts',
	'src/modules/payouts/payout.repository.ts',
	'src/modules/program-access/program-access.repository.ts',
	'src/modules/programs/program.repository.ts',
	'src/modules/reserves/reserve.repository.ts',
	'src/modules/stripe-payments/stripe-payment.repository.ts',
	'src/modules/subscriptions/subscription.repository.ts',
	'src/modules/surveys/survey.repository.ts',
	'src/modules/users/user.repository.ts',
];
