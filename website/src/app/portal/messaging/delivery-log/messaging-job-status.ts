import type { MessagingJobStatus } from '@/generated/prisma/client';

export const jobStatusVariant = (status: MessagingJobStatus) => {
	switch (status) {
		case 'completed':
			return 'verified';
		case 'running':
			return 'secondary';
		case 'failed':
			return 'destructive';
		case 'interrupted':
			return 'default';
	}
};
