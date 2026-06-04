import { ContributorReferralSource, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import Stripe from 'stripe';
import { CampaignReadService } from '../../campaign/campaign-read.service';
import { ContributorReadService } from '../../contributor/contributor-read.service';
import { ContributorWriteService } from '../../contributor/contributor-write.service';
import { type ContributorUpdateInput, type ContributorWithContact } from '../../contributor/contributor.types';
import { BaseService } from '../../core/base.service';
import { type ServiceResult } from '../../core/base.types';
import { resultFail, resultOk } from '../../core/service-result';
import { ProgramAccessReadService } from '../../program-access/program-access-read.service';
import { type UpdateContributorAfterCheckoutInput } from './legacy-stripe.types';

let legacyStripeClient: Stripe | undefined;

const getStripeClient = (): Stripe => {
	if (legacyStripeClient) {
		return legacyStripeClient;
	}

	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		throw new Error('Missing STRIPE_SECRET_KEY environment variable');
	}
	if (!stripeSecretKey.startsWith('sk_')) {
		throw new Error('Invalid STRIPE_SECRET_KEY format');
	}

	legacyStripeClient = new Stripe(stripeSecretKey, { typescript: true });

	return legacyStripeClient;
};

type LegacyHostedCheckoutInput = {
	amount: number;
	successUrl: string;
	recurring?: boolean;
	currency?: string;
	intervalCount?: number;
	stripeCustomerId?: string | null;
	campaignId?: string;
	accountId?: string;
	source?: string;
};

/** @deprecated Delete at go-live together with blue-theme donate routes. */
export class LegacyStripeService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly contributorReadService: ContributorReadService,
		private readonly contributorWriteService: ContributorWriteService,
		private readonly campaignService: CampaignReadService,
		private readonly programAccessService: ProgramAccessReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async createHostedCheckoutSession(data: LegacyHostedCheckoutInput): Promise<ServiceResult<string>> {
		try {
			const {
				amount,
				successUrl,
				currency = 'USD',
				intervalCount = 1,
				recurring = false,
				stripeCustomerId,
				campaignId,
				accountId,
				source,
			} = data;

			const metadata: Record<string, string> = {};
			if (campaignId) {
				metadata.campaignId = campaignId;
			}
			if (accountId) {
				metadata.accountId = accountId;
			}
			if (source) {
				metadata.source = source;
			}

			const stripe = getStripeClient();

			const price = await stripe.prices.create({
				active: true,
				unit_amount: amount,
				currency: currency.toLowerCase(),
				product: recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME,
				recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
			});

			const session = await stripe.checkout.sessions.create({
				mode: recurring ? 'subscription' : 'payment',
				customer: stripeCustomerId ?? undefined,
				customer_creation: !stripeCustomerId && !recurring ? 'always' : undefined,
				line_items: [{ price: price.id, quantity: 1 }],
				success_url: successUrl,
				locale: 'auto',
				...(Object.keys(metadata).length > 0 && { metadata }),
				...(recurring &&
					campaignId && {
						subscription_data: {
							metadata: { campaignId },
						},
					}),
			});

			return resultOk(session.url ?? '');
		} catch (error) {
			return resultFail(`Could not create Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	async createPortalProgramDonationCheckout(
		userId: string,
		input: {
			amount: number;
			programId: string;
			currency?: string;
			intervalCount?: number;
			recurring?: boolean;
		},
	): Promise<ServiceResult<string>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success || !accessResult.data.some((p) => p.programId === input.programId)) {
				return this.resultFail('Program not found or access denied');
			}

			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: {
					accountId: true,
					contactId: true,
					contact: {
						select: { id: true, email: true, firstName: true, lastName: true },
					},
				},
			});
			if (!user) {
				return this.resultFail('User account not found');
			}

			let stripeCustomerId: string | null = null;
			const contributor = await this.db.contributor.findUnique({
				where: { accountId: user.accountId },
				select: { stripeCustomerId: true },
			});

			if (contributor?.stripeCustomerId) {
				stripeCustomerId = contributor.stripeCustomerId;
			} else {
				// First-time portal donor: create Stripe Customer with user's email/name so Checkout
				// prefills and locks the email (no different-email mismatch).
				const email = user.contact?.email ?? null;
				if (!email) {
					return this.resultFail('User contact email is required for portal donations');
				}
				const name = [user.contact?.firstName, user.contact?.lastName].filter(Boolean).join(' ') || undefined;
				const createCustomerResult = await this.createStripeCustomerForPortal(email, name);
				if (!createCustomerResult.success) {
					return createCustomerResult;
				}
				stripeCustomerId = createCustomerResult.data;
				const contributorResult = await this.contributorWriteService.getOrCreateContributorForAccount(
					user.accountId,
					stripeCustomerId,
					user.contactId,
				);
				if (!contributorResult.success) {
					return this.resultFail(contributorResult.error);
				}
			}

			const campaignResult = await this.campaignService.getActiveCampaignForProgram(input.programId);
			if (!campaignResult.success) {
				return this.resultFail(campaignResult.error);
			}

			const baseUrl = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
			const successUrl = `${baseUrl}/portal/programs/${input.programId}/overview?donation=success`;

			const checkoutResult = await this.createHostedCheckoutSession({
				amount: input.amount,
				currency: input.currency ?? 'CHF',
				intervalCount: input.intervalCount ?? 1,
				recurring: input.recurring ?? false,
				successUrl,
				campaignId: campaignResult.data.id,
				accountId: user.accountId,
				source: 'portal',
				stripeCustomerId,
			});

			return checkoutResult;
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create portal donation checkout session: ${JSON.stringify(error)}`);
		}
	}

	private async createStripeCustomerForPortal(email: string, name?: string): Promise<ServiceResult<string>> {
		try {
			const customer = await getStripeClient().customers.create({
				email,
				name: name ?? undefined,
			});

			return this.resultOk(customer.id);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create Stripe customer: ${JSON.stringify(error)}`);
		}
	}

	async getCheckoutSession(sessionId: string): Promise<ServiceResult<Stripe.Checkout.Session>> {
		try {
			const checkoutSession = await getStripeClient().checkout.sessions.retrieve(sessionId);

			if (!checkoutSession.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			return this.resultOk(checkoutSession);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load Stripe checkout session: ${JSON.stringify(error)}`);
		}
	}

	async getContributorFromCheckoutSession(
		session: Stripe.Checkout.Session,
	): Promise<ServiceResult<ContributorWithContact | null>> {
		try {
			const customer = session.customer;
			if (!customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}
			const stripeCustomerId = typeof customer === 'string' ? customer : customer.id;
			const email = session.customer_details?.email ?? undefined;

			const contributorResult = await this.contributorReadService.findByStripeCustomerOrEmail(stripeCustomerId, email);

			if (!contributorResult.success) {
				return contributorResult;
			}

			return this.resultOk(contributorResult.data ?? null);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load contributor from checkout session: ${JSON.stringify(error)}`);
		}
	}

	async updateContributorAfterCheckout(input: UpdateContributorAfterCheckoutInput): Promise<ServiceResult<unknown>> {
		try {
			const { stripeCheckoutSessionId, user } = input;

			const session = await getStripeClient().checkout.sessions.retrieve(stripeCheckoutSessionId);
			if (!session.customer) {
				return this.resultFail('Checkout session has no Stripe customer');
			}

			const stripeCustomer = await getStripeClient().customers.retrieve(session.customer as string);
			if (stripeCustomer.deleted) {
				return this.resultFail(`Stripe customer ${stripeCustomer.id} was deleted`);
			}

			const contributorEmail = user.email ?? stripeCustomer.email ?? null;

			if (!contributorEmail) {
				return this.resultFail('A contributor email is required');
			}

			const existingResult = await this.contributorReadService.findByStripeCustomerOrEmail(
				stripeCustomer.id,
				contributorEmail,
			);

			if (!existingResult.success) {
				return existingResult;
			}

			let contributor = existingResult.data;

			if (!contributor) {
				const createResult = await this.contributorWriteService.getOrCreateContributorWithFirebaseAuth({
					stripeCustomerId: stripeCustomer.id,
					email: contributorEmail,
					firstName: user.personal.name,
					lastName: user.personal.lastname,
					referral: user.personal.referral ?? ContributorReferralSource.other,
				});

				if (!createResult.success) {
					return createResult;
				}

				contributor = createResult.data.contributor;
			}

			const updateInput: ContributorUpdateInput = {
				id: contributor.id,
				referral: user.personal.referral ?? ContributorReferralSource.other,
				needsOnboarding: false,
				contact: {
					update: {
						data: {
							firstName: user.personal.name,
							lastName: user.personal.lastname,
							email: user.email,
							gender: user.personal.gender ?? null,
							language: user.language,
							address: {
								upsert: {
									update: {
										country: user.address.country,
									},
									create: {
										street: '',
										number: '',
										city: '',
										zip: '',
										country: user.address.country,
									},
								},
							},
						},
					},
				},
			};

			return this.contributorWriteService.updateSelf(contributor.id, updateInput);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update contributor after checkout: ${JSON.stringify(error)}`);
		}
	}
}
