'use client';

import {
	addRecipientsFromPoolReducer,
	initialAddRecipientsFromPoolState,
	poolSelectionFilters,
	type PoolErrorCode,
} from '@/components/add-recipients-from-pool/add-recipients-from-pool-state';
import { activeCandidateFilters, canContinueCandidateSelection } from '@/components/candidate-selection/candidate-filters';
import { CandidateSelectionSection } from '@/components/candidate-selection/candidate-selection-section';
import { Currency, Profile } from '@/generated/prisma/enums';
import { websiteCurrencies } from '@/lib/i18n/utils';
import {
	assignProgramRecipientsFromPoolAction,
	getProgramRecipientPoolSetupAction,
	previewProgramRecipientPoolAction,
} from '@/modules/programs/program.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { TermList } from '@socialincome/design-system/data-display/term-list/term-list';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { QuantitySelector } from '@socialincome/design-system/forms/quantity-selector/quantity-selector';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import { WizardFooter } from '@socialincome/design-system/navigation/wizard-footer/wizard-footer';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useReducer, useState } from 'react';

type Props = {
	open: boolean;
	programId: string;
	onOpenChange: (open: boolean) => void;
	onAssigned: (assignedCount: number) => void;
};

const isProfile = (value: string): value is Profile => Object.values<string>(Profile).includes(value);
const isCurrency = (value: string): value is Currency => Object.values<string>(Currency).includes(value);

const poolErrorCode = (error: string): PoolErrorCode =>
	error === 'Not enough candidates available' ? 'not_enough' : 'generic';

export const AddRecipientsFromPoolDialog = ({ open, programId, onOpenChange, onAssigned }: Props) => {
	const t = useTranslations('add-recipients-from-pool');
	const tCountries = useTranslations('countries');
	const [state, dispatch] = useReducer(addRecipientsFromPoolReducer, initialAddRecipientsFromPoolState);
	const [retryToken, setRetryToken] = useState(0);
	const saving = state.status === 'saving';
	const { approach, focusIds, profiles, localPartnerIds, setup, quantity, displayCurrency } = state;
	const filters = poolSelectionFilters(state);
	const canContinue = canContinueCandidateSelection({
		approach: state.approach,
		matchingCount: state.matchingCount,
		isCounting: state.isCounting,
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		let cancelled = false;
		getProgramRecipientPoolSetupAction(programId)
			.then((result) => {
				if (cancelled) {
					return;
				}
				if (!result.success) {
					console.error(result.error);
					dispatch({ type: 'setupFailed', error: 'load' });

					return;
				}
				dispatch({ type: 'setupLoaded', setup: result.data });
			})
			.catch((error: unknown) => {
				console.error(error);
				if (!cancelled) {
					dispatch({ type: 'setupFailed', error: 'load' });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [open, programId, retryToken]);

	useEffect(() => {
		if (!open || !state.isCounting || setup === null || approach === null) {
			return;
		}

		let cancelled = false;
		const selection = activeCandidateFilters(approach, { focusIds, profiles, localPartnerIds });
		previewProgramRecipientPoolAction({ programId, ...selection })
			.then((result) => {
				if (cancelled) {
					return;
				}
				if (!result.success) {
					console.error(result.error);
					dispatch({ type: 'countsFailed', error: poolErrorCode(result.error) });

					return;
				}
				dispatch({
					type: 'countsLoaded',
					totalCount: result.data.totalCount,
					matchingCount: result.data.matchingCount,
				});
			})
			.catch((error: unknown) => {
				console.error(error);
				if (!cancelled) {
					dispatch({ type: 'countsFailed', error: 'generic' });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [open, state.isCounting, programId, setup, approach, focusIds, profiles, localPartnerIds]);

	useEffect(() => {
		if (!state.isCalculatingBudget || displayCurrency === null || quantity < 1 || setup === null) {
			return;
		}

		let cancelled = false;
		const selection = activeCandidateFilters(approach, { focusIds, profiles, localPartnerIds });
		previewProgramRecipientPoolAction({
			programId,
			...selection,
			recipientCount: quantity,
			displayCurrency,
		})
			.then((result) => {
				if (cancelled) {
					return;
				}
				if (!result.success) {
					console.error(result.error);
					dispatch({ type: 'budgetFailed', error: poolErrorCode(result.error) });

					return;
				}
				if (result.data.budget) {
					dispatch({ type: 'budgetLoaded', budget: result.data.budget });
				}
			})
			.catch((error: unknown) => {
				console.error(error);
				if (!cancelled) {
					dispatch({ type: 'budgetFailed', error: 'generic' });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [
		state.isCalculatingBudget,
		quantity,
		displayCurrency,
		setup,
		programId,
		approach,
		focusIds,
		profiles,
		localPartnerIds,
	]);

	const submit = () => {
		if (state.status === 'saving' || state.quantity < 1) {
			return;
		}
		dispatch({ type: 'submit' });
		assignProgramRecipientsFromPoolAction({ programId, ...filters, recipientCount: state.quantity })
			.then((result) => {
				if (!result.success) {
					console.error(result.error);
					dispatch({ type: 'submitFailed', error: poolErrorCode(result.error) });

					return;
				}
				onAssigned(result.data.assigned);
			})
			.catch((error: unknown) => {
				console.error(error);
				dispatch({ type: 'submitFailed', error: 'generic' });
			});
	};

	const displayCurrencies = setup
		? [setup.payoutCurrency, ...websiteCurrencies.filter((currency) => currency !== setup.payoutCurrency)]
		: [];

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!saving) {
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent
				size="lg"
				closeOnClickOutside={!saving}
				closeOnEscape={!saving}
				hideCloseButton={saving}
				closeLabel={t('close')}
			>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<div className="space-y-6">
						{state.error ? (
							<Alert variant="destructive">
								<AlertTitle>{t('error.title')}</AlertTitle>
								<AlertDescription data-testid="pool-error">{t(`error.${state.error}`)}</AlertDescription>
							</Alert>
						) : null}

						{state.status === 'loading' ? <p className="text-muted-foreground text-sm">{t('loading')}</p> : null}

						{state.status === 'error' ? (
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									dispatch({ type: 'loadStarted' });
									setRetryToken((token) => token + 1);
								}}
							>
								{t('actions.retry')}
							</Button>
						) : null}

						{setup && state.status !== 'loading' && state.status !== 'error' ? (
							<>
								<div data-testid="pool-country">
									<p className="text-sm font-medium">{t('country.label')}</p>
									<p className="mt-1">{tCountries(setup.countryCode)}</p>
								</div>

								{state.status === 'selection' ? (
									<CandidateSelectionSection
										approach={state.approach}
										focusItems={setup.focusOptions.map((focus) => ({ value: focus.id, label: focus.name }))}
										selectedFocusIds={state.focusIds}
										profileItems={Object.values(Profile).map((profile) => ({
											value: profile,
											label: t(`profiles.${profile}`),
										}))}
										selectedProfiles={state.profiles}
										localPartnerItems={setup.localPartnerOptions.map((partner) => ({
											value: partner.id,
											label: partner.name,
										}))}
										selectedLocalPartnerIds={state.localPartnerIds}
										isCounting={state.isCounting}
										isUniversalEmpty={state.approach === 'universal' && state.totalCount === 0}
										isTargetedEmpty={state.approach === 'targeted' && !state.isCounting && state.matchingCount === 0}
										labels={{
											title: t('selection.title'),
											errorPrefix: t('error.title'),
											recommended: t('selection.recommended'),
											universalLabel: t('selection.all.label'),
											universalDescription: t('selection.all.description'),
											targetedLabel: t('selection.targeted.label'),
											targetedDescription: t('selection.targeted.description'),
											focuses: t('selection.focuses'),
											profiles: t('selection.profiles'),
											localPartners: t('selection.local_partners'),
											loading: t('selection.loading'),
										}}
										universalCount={
											<span data-testid="pool-matching-count">
												<strong>{state.totalCount.toLocaleString()}</strong> {t('selection.all.available')}
											</span>
										}
										targetedCount={
											<span data-testid="pool-matching-count">
												{t('selection.targeted.matching', {
													matching: state.matchingCount,
													total: state.totalCount,
												})}
											</span>
										}
										universalEmpty={t('selection.all.empty')}
										targetedEmpty={
											<span>
												{t('selection.targeted.empty')}{' '}
												<Button
													type="button"
													variant="link"
													size="inline"
													onClick={() => dispatch({ type: 'selectApproach', approach: 'universal' })}
												>
													{t('selection.clear_filters')}
												</Button>
											</span>
										}
										onChangeApproach={(approach) => dispatch({ type: 'selectApproach', approach })}
										onToggleFocus={(focusId) => dispatch({ type: 'toggleFocus', focusId })}
										onToggleProfile={(profile) => {
											if (isProfile(profile)) {
												dispatch({ type: 'toggleProfile', profile });
											}
										}}
										onToggleLocalPartner={(localPartnerId) => dispatch({ type: 'toggleLocalPartner', localPartnerId })}
									/>
								) : (
									<div className="space-y-8">
										<QuantitySelector
											label={t('quantity.title')}
											value={state.quantity}
											min={1}
											max={state.matchingCount}
											disabled={saving}
											onChange={(quantity) => dispatch({ type: 'setQuantity', quantity })}
											atMaxHint={t('quantity.max_hint')}
											emptyMessage={t('quantity.empty')}
											inputTestId="pool-quantity-input"
											sliderTestId="pool-quantity-slider"
										/>

										<TermList
											title={t('terms.title')}
											testId="pool-terms"
											items={[
												{
													label: t('terms.duration'),
													value: t('terms.months', { count: setup.programDurationInMonths }),
													testId: 'pool-program-duration',
												},
												{
													label: t('terms.payout_amount'),
													value: setup.payoutPerInterval.toLocaleString('de-CH'),
													testId: 'pool-payout-amount',
												},
												{
													label: t('terms.payout_currency'),
													value: setup.payoutCurrency,
													testId: 'pool-payout-currency',
												},
												{
													label: t('terms.payout_interval'),
													value: t(`terms.interval.${setup.payoutInterval}`),
													testId: 'pool-payout-interval',
												},
											]}
										/>

										<div className="space-y-2">
											<div className="flex items-end justify-between gap-4">
												<div>
													<p className="text-sm font-medium">{t('cost.title')}</p>
													<p
														data-testid="pool-additional-cost"
														className="text-3xl font-medium tabular-nums"
														aria-busy={state.isCalculatingBudget}
													>
														{state.displayCurrency}{' '}
														{state.budget ? Math.round(state.budget.calculatedTotalBudget).toLocaleString('de-CH') : '–'}
													</p>
													{state.isCalculatingBudget ? (
														<p className="text-muted-foreground text-xs">{t('cost.updating')}</p>
													) : (
														state.budget?.exchangeRateText && (
															<p className="text-muted-foreground text-xs">{state.budget.exchangeRateText}</p>
														)
													)}
												</div>
												<Select
													value={state.displayCurrency ?? setup.payoutCurrency}
													onValueChange={(value) => {
														if (isCurrency(value)) {
															dispatch({ type: 'setDisplayCurrency', currency: value });
														}
													}}
													disabled={saving}
												>
													<div className="w-24">
														<SelectTrigger aria-label={t('cost.display_currency')}>
															<SelectValue />
														</SelectTrigger>
													</div>
													<SelectContent>
														{displayCurrencies.map((currency) => (
															<SelectItem key={currency} value={currency}>
																{currency}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								)}
							</>
						) : null}
					</div>
				</DialogBody>
				{setup && (state.status === 'selection' || state.status === 'preview' || state.status === 'saving') ? (
					<div className="px-6 pb-6">
						<WizardFooter
							edge="bleed"
							progress={
								<StepIndicator
									variant="dots"
									ariaLabel={t('steps.label')}
									activeIndex={state.status === 'selection' ? 0 : 1}
									steps={[{ label: t('steps.selection') }, { label: t('steps.quantity') }]}
								/>
							}
							back={
								<Button
									type="button"
									variant="outline"
									disabled={saving || state.status === 'selection'}
									onClick={() => dispatch({ type: 'back' })}
								>
									{t('actions.back')}
								</Button>
							}
							primary={
								state.status === 'selection' ? (
									<Button type="button" disabled={!canContinue} onClick={() => dispatch({ type: 'continue' })}>
										{t('actions.continue')}
									</Button>
								) : (
									<Button type="button" disabled={saving || state.isCounting || state.quantity < 1} onClick={submit}>
										{saving ? t('actions.adding') : t('actions.add', { count: state.quantity })}
									</Button>
								)
							}
						/>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
};
