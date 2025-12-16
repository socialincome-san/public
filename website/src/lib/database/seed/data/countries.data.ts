import {
  Country,
  PaymentProvider,
  NetworkTechnology,
  SanctionRegime,
  Prisma
} from '@prisma/client';


export const countriesData: Country[] = [
  {
    id: 'country-algeria',
    name: 'Algeria',
    microfinanceIndex: new Prisma.Decimal('6.05'),
    latestSurveyDate: new Date('2025-02-06'),
    microfinanceSourceLinkId: 'source-link-wfp-2025',
    paymentProviders: [PaymentProvider.orange_money],
    populationCoverage: new Prisma.Decimal('98.2'),
    networkTechnology: NetworkTechnology.g3,
    networkSourceLinkId: 'source-link-itu-coverage',
    sanctions: [],
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 'country-angola',
    name: 'Angola',
    microfinanceIndex: null,
    latestSurveyDate: null,
    microfinanceSourceLinkId: 'source-link-si-estimate',
    paymentProviders: [PaymentProvider.orange_money],
    populationCoverage: new Prisma.Decimal('85.7'),
    networkTechnology: NetworkTechnology.g3,
    networkSourceLinkId: 'source-link-itu-coverage',
    sanctions: [SanctionRegime.eu, SanctionRegime.us],
    createdAt: new Date(),
    updatedAt: null
  }
];