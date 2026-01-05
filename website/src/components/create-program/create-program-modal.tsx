'use client';

import { ReactNode, useEffect, useReducer } from 'react';

import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { SpinnerIcon } from '@socialincome/ui';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { CountryTable } from './country-table';

type State = {
	open: boolean;
	loading: boolean;
	rows: ProgramCountryFeasibilityRow[];
};

type Action =
	| { type: 'OPEN' }
	| { type: 'CLOSE' }
	| { type: 'LOAD_START' }
	| { type: 'LOAD_SUCCESS'; rows: ProgramCountryFeasibilityRow[] }
	| { type: 'LOAD_ERROR' };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'OPEN':
			return { ...state, open: true };

		case 'CLOSE':
			return { ...state, open: false };

		case 'LOAD_START':
			return { ...state, loading: true };

		case 'LOAD_SUCCESS':
			return { ...state, loading: false, rows: action.rows };

		case 'LOAD_ERROR':
			return { ...state, loading: false };

		default:
			return state;
	}
}

type CreateProgramModalProps = {
	trigger: ReactNode;
};

export function CreateProgramModal({ trigger }: CreateProgramModalProps) {
	const [state, dispatch] = useReducer(reducer, {
		open: false,
		loading: false,
		rows: [],
	});

	useEffect(() => {
		if (!state.open) return;

		let cancelled = false;

		async function loadCountries() {
			dispatch({ type: 'LOAD_START' });

			const res = await getProgramCountryFeasibilityAction();

			if (cancelled) return;

			if (res.success) {
				dispatch({ type: 'LOAD_SUCCESS', rows: res.data.rows });
			} else {
				console.error(res.error);
				dispatch({ type: 'LOAD_ERROR' });
			}
		}

		loadCountries();

		return () => {
			cancelled = true;
		};
	}, [state.open]);

	return (
		<>
			<div onClick={() => dispatch({ type: 'OPEN' })}>{trigger}</div>

			<Dialog open={state.open} onOpenChange={(open) => dispatch({ type: open ? 'OPEN' : 'CLOSE' })}>
				<DialogContent variant="large">
					<DialogHeader>
						<DialogTitle>Initiate New Program</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Choose a country</h3>

						{state.loading ? (
							<div className="text-muted-foreground flex items-center justify-center py-12">
								<SpinnerIcon className="h-5 w-5 animate-spin" />
							</div>
						) : (
							<CountryTable rows={state.rows} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
