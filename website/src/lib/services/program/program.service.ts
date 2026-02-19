import { ContributionStatus, PayoutStatus, ProgramPermission, SurveyStatus } from '@/generated/prisma/client';
import { getCountryNameByCode } from '@/lib/types/country';
import { slugify } from '@/lib/utils/string-utils';
import { CandidateService } from '../candidate/candidate.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import { CreateProgramInput, ProgramOption, ProgramWallet, ProgramWallets, PublicProgramDetails } from './program.types';

export class ProgramService extends BaseService {
  private programAccessService = new ProgramAccessService();
  private candidateService = new CandidateService();

  async getProgramWallets(userId: string): Promise<ServiceResult<ProgramWallets>> {
    try {
      const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

      if (!accessibleProgramsResult.success) {
        return this.resultFail(accessibleProgramsResult.error);
      }

      const accessiblePrograms = accessibleProgramsResult.data;
      if (accessiblePrograms.length === 0) {
        return this.resultOk({ wallets: [] });
      }

      const programIds = accessiblePrograms.map((p) => p.programId);

      const programs = await this.db.program.findMany({
        where: { id: { in: programIds } },
        select: {
          id: true,
          name: true,
          country: {
            select: { isoCode: true },
          },
          payoutCurrency: true,
          recipients: {
            select: {
              payouts: {
                where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
                select: { amount: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const wallets: ProgramWallet[] = await Promise.all(
        programs.map(async (program) => {
          const permission = accessiblePrograms.some(
            (a) => a.programId === program.id && a.permission === ProgramPermission.operator,
          )
            ? ProgramPermission.operator
            : ProgramPermission.owner;

          const recipientsCount = program.recipients.length;

          let totalPayoutsSum = 0;
          for (const recipient of program.recipients) {
            for (const payout of recipient.payouts) {
              totalPayoutsSum += Number(payout.amount ?? 0);
            }
          }

          const isReadyForFirstPayoutsResult = await this.isReadyForFirstPayoutInterval(program.id);

          return {
            id: program.id,
            programName: program.name,
            country: program.country.isoCode,
            payoutCurrency: program.payoutCurrency,
            recipientsCount,
            totalPayoutsSum,
            permission,
            isReadyForFirstPayouts: isReadyForFirstPayoutsResult.success ? isReadyForFirstPayoutsResult.data : false,
          };
        }),
      );

      return this.resultOk({ wallets });
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not fetch programs: ${JSON.stringify(error)}`);
    }
  }

  async getProgramWalletsProgramScoped(userId: string, programId: string): Promise<ServiceResult<ProgramWallet>> {
    const base = await this.getProgramWallets(userId);

    if (!base.success) {
      return this.resultFail(base.error);
    }

    const wallet = base.data.wallets.find((w) => w.id === programId);

    if (!wallet) {
      return this.resultFail('Program not found or not accessible');
    }

    return this.resultOk(wallet);
  }

  async getOptions(userId: string): Promise<ServiceResult<ProgramOption[]>> {
    try {
      const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

      if (!accessibleProgramsResult.success) {
        return this.resultFail(accessibleProgramsResult.error);
      }

      const programs = accessibleProgramsResult.data.map((p) => ({
        id: p.programId,
        name: p.programName,
      }));

      return this.resultOk(programs);
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not fetch program options: ${JSON.stringify(error)}`);
    }
  }

  async create(userId: string, input: CreateProgramInput): Promise<ServiceResult<{ programId: string }>> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { activeOrganizationId: true },
      });

      if (!user?.activeOrganizationId) {
        return this.resultFail('User has no active organization');
      }

      const operatorFallbackOrg = await this.db.organization.findFirst({
        where: { isOperatorFallback: true },
        select: { id: true },
      });

      if (!operatorFallbackOrg) {
        return this.resultFail('Operator fallback organization not found');
      }

      const country = await this.db.country.findUnique({
        where: { id: input.countryId },
        select: { isoCode: true },
      });

      if (!country) {
        return this.resultFail('Country not found');
      }

      const program = await this.db.program.create({
        data: {
          name: `${getCountryNameByCode(country.isoCode)} Program ${Math.floor(10000 + Math.random() * 90000)}`,
          countryId: input.countryId,
          amountOfRecipientsForStart: input.amountOfRecipientsForStart ?? null,
          programDurationInMonths: input.programDurationInMonths,
          payoutPerInterval: input.payoutPerInterval,
          payoutCurrency: input.payoutCurrency,
          payoutInterval: input.payoutInterval,
          targetCauses: input.targetCauses,
        },
      });

      const accessResult = await this.programAccessService.createInitialAccessesForProgram({
        programId: program.id,
        ownerOrganizationId: user.activeOrganizationId,
        operatorFallbackOrganizationId: operatorFallbackOrg.id,
      });

      if (!accessResult.success) {
        return this.resultFail(accessResult.error);
      }

      if (input.amountOfRecipientsForStart > 0) {
        const assignResult = await this.candidateService.assignRandomCandidatesToProgram(
          program.id,
          input.amountOfRecipientsForStart,
          country.isoCode,
          input.targetCauses,
        );

        if (!assignResult.success) {
          return this.resultFail(assignResult.error);
        }
      }

      return this.resultOk({ programId: program.id });
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not create program: ${JSON.stringify(error)}`);
    }
  }

  async getPublicProgramBySlug(slug: string): Promise<ServiceResult<PublicProgramDetails>> {
    try {
      const programs = await this.db.program.findMany({
        select: {
          id: true,
          name: true,
          targetCauses: true,
          amountOfRecipientsForStart: true,
          programDurationInMonths: true,
          payoutPerInterval: true,
          payoutCurrency: true,
          payoutInterval: true,
          country: {
            select: { isoCode: true },
          },
          programAccesses: {
            select: {
              permission: true,
              organization: { select: { name: true } },
            },
          },
          recipients: {
            select: {
              startDate: true,
              payouts: {
                where: {
                  status: {
                    in: [PayoutStatus.paid, PayoutStatus.confirmed],
                  },
                },
                select: { amount: true },
              },
              surveys: {
                where: { status: SurveyStatus.completed },
                select: { id: true },
              },
            },
          },
        },
      });

      const program = programs.find((p) => slugify(p.name) === slug);

      if (!program) {
        return this.resultFail('Program not found');
      }

      const ownerAccess = program.programAccesses.find((a) => a.permission === ProgramPermission.owner);

      const operatorAccess = program.programAccesses.find((a) => a.permission === ProgramPermission.operator);

      let totalPayoutsSum = 0;
      let totalPayoutsCount = 0;
      let completedSurveysCount = 0;
      let earliestStart: Date | null = null;

      for (const r of program.recipients) {
        if (r.startDate && (!earliestStart || r.startDate < earliestStart)) {
          earliestStart = r.startDate;
        }

        for (const payout of r.payouts) {
          totalPayoutsSum += Number(payout.amount ?? 0);
          totalPayoutsCount++;
        }

        completedSurveysCount += r.surveys.length;
      }

      return this.resultOk({
        programId: program.id,
        programName: program.name,

        countryIsoCode: program.country.isoCode,

        ownerOrganizationName: ownerAccess?.organization.name ?? null,
        operatorOrganizationName: operatorAccess?.organization.name ?? null,

        targetCauses: program.targetCauses,

        amountOfRecipientsForStart: program.amountOfRecipientsForStart,
        programDurationInMonths: program.programDurationInMonths,
        payoutPerInterval: Number(program.payoutPerInterval),
        payoutCurrency: program.payoutCurrency,
        payoutInterval: program.payoutInterval,

        recipientsCount: program.recipients.length,
        totalPayoutsCount,
        totalPayoutsSum,

        completedSurveysCount,
        startedAt: earliestStart,
      });
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not load public program: ${JSON.stringify(error)}`);
    }
  }

  async getProgramIdBySlug(slug: string): Promise<ServiceResult<string>> {
    try {
      const programs = await this.db.program.findMany({ select: { id: true, name: true } });
      const match = programs.find((p) => slugify(p.name) === slug);
      if (!match) {
        return this.resultFail('Program not found');
      }

      return this.resultOk(match.id);
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not resolve programId by slug: ${JSON.stringify(error)}`);
    }
  }

  async getProgramNameById(programId: string): Promise<ServiceResult<string>> {
    try {
      const program = await this.db.program.findUnique({
        where: { id: programId },
        select: { name: true },
      });

      if (!program) {
        return this.resultFail('Program not found');
      }

      return this.resultOk(program.name);
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not fetch program name: ${JSON.stringify(error)}`);
    }
  }

  async isReadyForFirstPayoutInterval(programId: string): Promise<ServiceResult<boolean>> {
    try {
      const program = await this.db.program.findUnique({
        where: { id: programId },
        select: {
          payoutPerInterval: true,
          recipients: {
            select: { id: true },
          },
          campaigns: {
            select: {
              contributions: {
                where: { status: ContributionStatus.succeeded },
                select: { amountChf: true },
              },
            },
          },
        },
      });

      if (!program) {
        return this.resultFail('Program not found');
      }

      const recipientCount = program.recipients.length;

      if (recipientCount === 0) {
        return this.resultOk(false);
      }

      let totalContributions = 0;

      for (const campaign of program.campaigns) {
        for (const contribution of campaign.contributions) {
          totalContributions += Number(contribution.amountChf);
        }
      }

      const requiredAmount = recipientCount * Number(program.payoutPerInterval);

      const isReady = totalContributions >= requiredAmount;

      return this.resultOk(isReady);
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not check program readiness: ${JSON.stringify(error)}`);
    }
  }
}
