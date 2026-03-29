import { MessageChannel } from '@/generated/prisma/enums';
import { MessageProvider } from './message-provider';

export class MessageProviderRegistry {
	private providers = new Map<MessageChannel, MessageProvider>();

	register(provider: MessageProvider): void {
		this.providers.set(provider.channel, provider);
	}

	get(channel: MessageChannel): MessageProvider | undefined {
		return this.providers.get(channel);
	}

	getAvailableChannels(): MessageChannel[] {
		return Array.from(this.providers.keys());
	}
}
