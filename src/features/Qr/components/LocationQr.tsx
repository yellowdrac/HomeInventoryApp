import { QrCode } from '@/core/components/ui';
import { buildLocationUrl } from '@features/Qr/lib/locationUrl';

interface LocationQrProps {
  /** The location's QR slug; encoded as `${publicAppUrl}/l/{slug}`. */
  slug: string;
  /** Location name, used to build the accessible label. */
  name: string;
  size?: number;
  className?: string;
}

/**
 * Renders the QR code for a single location. Encodes the location's deep-link
 * URL so scanning it (native camera or in-app scanner) opens the app at the
 * location's contents.
 */
export function LocationQr({ slug, name, size, className }: LocationQrProps) {
  return (
    <QrCode
      value={buildLocationUrl(slug)}
      size={size ?? 160}
      title={`QR code for ${name}`}
      className={className}
    />
  );
}
