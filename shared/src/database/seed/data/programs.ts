import { Program as PrismaProgram } from '@prisma/client';
import { ORG1_ID, ORG2_ID, ORG3_ID } from './organizations';

const makeProgram = (
	i: number,
	operatorOrgId: string,
	viewerOrgId: string
): PrismaProgram => ({
	id: `program-${i}`,
	name: `Program ${i}`,
	totalPayments: 36,
	payoutAmount: 700,
	payoutCurrency: 'SLE',
	payoutInterval: 'monthly',
	operatorOrganizationId: operatorOrgId,
	viewerOrganizationId: viewerOrgId,
	createdAt: new Date(),
	updatedAt: null,
});

export const programsData: PrismaProgram[] = [
	makeProgram(1, ORG1_ID, ORG2_ID),
	makeProgram(2, ORG2_ID, ORG1_ID),
	makeProgram(3, ORG3_ID, ORG3_ID),
];

export const PROGRAM1_ID = programsData[0].id;
export const PROGRAM2_ID = programsData[1].id;
export const PROGRAM3_ID = programsData[2].id;