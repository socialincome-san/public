import type { MessagingChannel } from '@/generated/prisma/client';

export type Assignment = { source: 'field'; path: string } | { source: 'constant'; value: string };

export type VariableAssignments = Record<string, Assignment>;

export type TwilioTemplateSummary = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	whatsappStatus: string | null;
	whatsappCategory: string | null;
};

export type ParsedVariable = {
	key: string;
	exampleValue: string | null;
};

export type TwilioTemplateDetail = {
	sid: string;
	friendlyName: string;
	language: string;
	contentType: string | null;
	body: string | null;
	variables: ParsedVariable[];
	supportedChannels: MessagingChannel[];
};
