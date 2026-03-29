import { MessageChannel } from '@/generated/prisma/enums';
import { ServiceResult } from '../../core/base.types';

export type SendMessageRequest = {
	to: string;
	body: string;
	subject?: string;
};

export type SendMessageResponse = {
	externalId: string;
};

export interface MessageProvider {
	readonly channel: MessageChannel;
	send(request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>>;
}
