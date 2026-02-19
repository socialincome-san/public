import { WebsiteLanguage, mainWebsiteLanguages } from '@/lib/i18n/utils';
import { subscribeToNewsletterAction, unsubscribeFromNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { SupportedLanguage } from '@/lib/services/sendgrid/types';
import { ProfileFormOutput } from './schemas';

export const toggleNewsletter = async (values: ProfileFormOutput, session: ContributorSession, isSubscribed: boolean) => {
  if (values.type !== 'contributor') {
    return { success: true };
  }

  const newsletter = values.newsletter ?? false;
  const email = values.email;

  if (!email) {
    return { success: true };
  }
  if (newsletter === isSubscribed) {
    return { success: true };
  }

  const language = formatNewsletterLanguage(values.language);

  if (newsletter) {
    return subscribeToNewsletterAction({
      email,
      firstname: values.firstName,
      lastname: values.lastName,
      language,
      country: session.country!,
      isContributor: true,
    });
  }

  return unsubscribeFromNewsletterAction();
};

const formatNewsletterLanguage = (lang?: string): SupportedLanguage => {
  return lang && mainWebsiteLanguages.includes(lang as WebsiteLanguage) ? (lang as SupportedLanguage) : 'en';
};
