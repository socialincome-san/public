'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { ContributorFormCreateInput, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrThrow, getOptionalContributor } from '../firebase/current-contributor';

export const createContributorAction = async (data: ContributorFormCreateInput) => {
  const user = await getAuthenticatedUserOrThrow();
  const contributorService = new ContributorService();
  const res = await contributorService.create(user.id, data);
  revalidatePath('/portal/management/contributors');

  return res;
};

export const updateContributorAction = async (contributor: ContributorUpdateInput) => {
  const user = await getAuthenticatedUserOrThrow();
  const contributorService = new ContributorService();
  const res = await contributorService.update(user.id, contributor);
  revalidatePath('/portal/management/contributors');

  return res;
};

export const getContributorAction = async (contributorId: string) => {
  const user = await getAuthenticatedUserOrThrow();
  const contributorService = new ContributorService();

  return contributorService.get(user.id, contributorId);
};

export const getOptionalContributorAction = async () => {
  return getOptionalContributor();
};

export const updateSelfAction = async (data: ContributorUpdateInput) => {
  const contributor = await getAuthenticatedContributorOrThrow();
  const contributorService = new ContributorService();
  const res = await contributorService.updateSelf(contributor.id, data);
  revalidatePath('/dashboard/profile');

  return res;
};
