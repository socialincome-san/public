import { BlockWrapper } from '@/components/block-wrapper';
import { PartnershipMarqueeRow } from '@/components/partnership-badge/partnership-marquee-row';
import type {
  Partnership,
  PartnershipsCard,
} from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Markdown from 'react-markdown';

type Props = {
  blok: PartnershipsCard;
};

const isResolvedPartnership = (
  entry: ISbStoryData<Partnership> | string,
): entry is ISbStoryData<Partnership> => typeof entry !== 'string';

export const PartnershipsCardBlock = ({ blok }: Props) => {
  const entries = (blok.partnerships ?? [])
    .filter(isResolvedPartnership)
    .map((entry) => entry.content);

  const rows = [
    entries.filter((_, index) => index % 2 === 0),
    entries.filter((_, index) => index % 2 === 1),
  ].filter((row) => row.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
      <div className="bg-background overflow-hidden rounded-3xl p-8 shadow-lg md:p-12">
        <p className="text-sm font-medium text-[hsl(var(--chart-2))]">
          Inflows
        </p>

        <h2 className="mt-4 text-3xl font-bold">{blok.title}</h2>

        {blok.description && (
          <div className="mt-4 max-w-3xl text-lg">
            <Markdown>{blok.description}</Markdown>
          </div>
        )}

        <div className="partnerships-marquee-mask mt-8 space-y-3">
          import { BlockWrapper } from '@/components/block-wrapper';
import { PartnershipMarqueeRow } from '@/components/partnership-badge/partnership-marquee-row';
import type {
  Partnership,
  PartnershipsCard,
} from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Markdown from 'react-markdown';

type Props = {
  blok: PartnershipsCard;
};

const isResolvedPartnership = (
  entry: ISbStoryData<Partnership> | string,
): entry is ISbStoryData<Partnership> => typeof entry !== 'string';

export const PartnershipsCardBlock = ({ blok }: Props) => {
  const entries = (blok.partnerships ?? [])
    .filter(isResolvedPartnership)
    .map((entry) => entry.content);

  const rows = [
    entries.filter((_, index) => index % 2 === 0),
    entries.filter((_, index) => index % 2 === 1),
  ].filter((row) => row.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
      <div className="bg-background overflow-hidden rounded-3xl p-8 shadow-lg md:p-12">
        <p className="text-sm font-medium text-[hsl(var(--chart-2))]">
          Inflows
        </p>

        <h2 className="mt-4 text-3xl font-bold">{blok.title}</h2>

        {blok.description && (
          <div className="mt-4 max-w-3xl text-lg">
            <Markdown>{blok.description}</Markdown>
          </div>
        )}

        <div className="partnerships-marquee-mask mt-8 space-y-3">
          {rows.map((row, rowIndex) => (
  <PartnershipMarqueeRow
    key={rowIndex === 0 ? 'first-row' : 'second-row'}
    entries={row}
    reverse={rowIndex === 1}
  />
))}
              <div
                className={`partnerships-marquee flex w-max ${
                  rowIndex === 1 ? 'partnerships-marquee-reverse' : ''
                }`}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    inert={copy === 1 ? true : undefined}
                    className="flex shrink-0 gap-3 pr-3"
                  >
                    {row.map((entry) => (
                      <PartnershipBadge
                        key={`${copy}-${entry._uid}`}
                        partnership={entry}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BlockWrapper>
  );
};
              <div
                className={`partnerships-marquee flex w-max ${
                  rowIndex === 1 ? 'partnerships-marquee-reverse' : ''
                }`}
              >
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    inert={copy === 1 ? true : undefined}
                    className="flex shrink-0 gap-3 pr-3"
                  >
                    {row.map((entry) => (
                      <PartnershipBadge
                        key={`${copy}-${entry._uid}`}
                        partnership={entry}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BlockWrapper>
  );
};