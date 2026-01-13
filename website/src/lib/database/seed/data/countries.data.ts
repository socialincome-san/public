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
    isActive: true,
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
    isActive: true,
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
  },
  {
    id: 'country-burkina-faso',
    name: 'Burkina Faso',
    isActive: false,
    microfinanceIndex: new Prisma.Decimal('5.10'),
    latestSurveyDate: new Date('2024-09-15'),
    microfinanceSourceLinkId: 'source-link-wfp-2024',
    paymentProviders: [PaymentProvider.orange_money],
    populationCoverage: new Prisma.Decimal('79.4'),
    networkTechnology: NetworkTechnology.g3,
    networkSourceLinkId: 'source-link-itu-coverage',
    sanctions: [],
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 'country-tanzania',
    name: 'Tanzania',
    isActive: false,
    microfinanceIndex: new Prisma.Decimal('6.80'),
    latestSurveyDate: new Date('2023-11-02'),
    microfinanceSourceLinkId: 'source-link-wbg-fin-inclusion',
    paymentProviders: [PaymentProvider.orange_money],
    populationCoverage: new Prisma.Decimal('92.1'),
    networkTechnology: NetworkTechnology.g4,
    networkSourceLinkId: 'source-link-itu-coverage',
    sanctions: [],
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 'country-ethiopia',
    name: 'Ethiopia',
    isActive: false,
    microfinanceIndex: new Prisma.Decimal('4.50'),
    latestSurveyDate: new Date('2023-06-30'),
    microfinanceSourceLinkId: 'source-link-wbg-fin-inclusion',
    paymentProviders: [],
    populationCoverage: new Prisma.Decimal('68.3'),
    networkTechnology: NetworkTechnology.g3,
    networkSourceLinkId: 'source-link-itu-coverage',
    sanctions: [SanctionRegime.us],
    createdAt: new Date(),
    updatedAt: null
  },
];