import type { ReactElement, SVGProps } from 'react';
import {
  MapIcon,
  DoorOpenIcon,
  ArmchairIcon,
  BoxIcon,
  MapPinIcon,
} from '@/core/components/icons';
import { LocationType } from '@features/Locations/types';

type SvgIcon = (props: SVGProps<SVGSVGElement>) => ReactElement;

const ICON_BY_TYPE: Record<LocationType, SvgIcon> = {
  [LocationType.Zone]: MapIcon,
  [LocationType.Room]: DoorOpenIcon,
  [LocationType.Furniture]: ArmchairIcon,
  [LocationType.Container]: BoxIcon,
  [LocationType.Spot]: MapPinIcon,
};

// `type` shadows the SVG `type` attribute, so omit it from the passthrough props.
interface LocationTypeIconProps extends Omit<SVGProps<SVGSVGElement>, 'type'> {
  type: LocationType;
}

/** Renders the lucide-style icon that represents a given location type. */
export function LocationTypeIcon({ type, ...props }: LocationTypeIconProps) {
  const Icon = ICON_BY_TYPE[type];
  return <Icon {...props} />;
}
