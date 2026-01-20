import { SourceLink } from '@prisma/client';

export const sourceLinksData: SourceLink[] = [
  {
    id: 'source-link-1',
    href: 'https://www.wfp.org/publications',
    text: 'WFP – Microfinance Index Survey (2025)',
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 'source-link-2',
    href: 'https://www.wfp.org/publications',
    text: 'SI Estimate – Microfinance Override',
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 'source-link-3',
    href: 'https://www.itu.int/en/ITU-D/Statistics',
    text: 'ITU – Mobile Network Coverage Statistics',
    createdAt: new Date(),
    updatedAt: null
  }
];