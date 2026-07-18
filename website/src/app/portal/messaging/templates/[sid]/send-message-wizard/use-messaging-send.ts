'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import { getMessagingJobAction, startMessagingSendAction } from '@/lib/server-actions/messaging-actions';
import type { MessagingJobStatusView } from '@/lib/services/twilio/messaging/dispatch/dispatch.types';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import type { VariableAssignments } from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SendPhase = 'idle' | 'running' | 'results';

type StartInput = {
	templateSid: string;
	channel: MessagingChannel;
	recipientType: MessagingRecipientType;
	selection: SelectionState;
	assignments: VariableAssignments;
};

type MessagingSend = {
	phase: SendPhase;
	status: MessagingJobStatusView | null;
	error: string | null;
	start: (input: StartInput) => void;
};

/**
 * Drives a single messaging send from confirmation to completion. `dispatchSend` runs the whole
 * send synchronously server-side and only resolves once the job is finished, so there is nothing
 * to poll: `start` fires the send, then fetches the finished job status once. The review step is
 * the confirmation, so there is no separate confirm phase. Guards against double-starts and
 * against state updates after the component unmounts.
 */
export const useMessagingSend = (): MessagingSend => {
	const [phase, setPhase] = useState<SendPhase>('idle');
	const [status, setStatus] = useState<MessagingJobStatusView | null>(null);
	const [error, setError] = useState<string | null>(null);
	const activeRef = useRef(true);
	const startedRef = useRef(false);

	useEffect(() => {
		// Set in the body (not just the cleanup) so React StrictMode's setup → cleanup → setup
		// mount cycle ends with active === true rather than a stale false.
		activeRef.current = true;

		return () => {
			activeRef.current = false;
		};
	}, []);

	const start = useCallback((input: StartInput) => {
		if (startedRef.current) {
			return;
		}
		startedRef.current = true;
		setPhase('running');
		setError(null);
		setStatus(null);

		void (async () => {
			try {
				const result = await startMessagingSendAction(input);
				if (!activeRef.current) {
					return;
				}
				if (!result.success) {
					setError(result.error);
					setPhase('results');

					return;
				}

				const statusResult = await getMessagingJobAction(result.data.jobId);
				if (!activeRef.current) {
					return;
				}
				if (statusResult.success) {
					setStatus(statusResult.data);
				} else {
					setError(statusResult.error);
				}
				setPhase('results');
			} catch (err) {
				if (!activeRef.current) {
					return;
				}
				setError(err instanceof Error ? err.message : 'The send could not be completed.');
				setPhase('results');
			}
		})();
	}, []);

	return { phase, status, error, start };
};
