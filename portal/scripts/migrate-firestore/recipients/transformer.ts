import { Recipient as PrismaRecipient } from '@prisma/client';
import { FireStoreRecipient } from './firestore-type';

export class Transformer {
  public transform(fireStoreRecipients: FireStoreRecipient[]): Promise<PrismaRecipient[]> {
    return Promise.resolve(
      fireStoreRecipients.map((r) => ({
        id: r.firstName,
        userId: '',
        organizationId: '',
        programId: '',
        localPartnerId: '',
        createdAt: new Date(),
        updatedAt: null,
      })),
    );
  }
}
