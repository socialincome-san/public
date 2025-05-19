import { prisma } from '@/server/prisma';
import { Recipient as PrismaRecipient } from '@prisma/client';

export class Importer {
  public async import(recipients: PrismaRecipient[]): Promise<number> {
    const result = await prisma.recipient.createMany({
      data: recipients,
      skipDuplicates: true,
    });

    return result.count;
  }
}
