import { EntityReference } from "@camberi/firecms";

export interface BuildCollectionProps {
  isGlobalAdmin: boolean;
  organisations?: EntityReference[];
}
