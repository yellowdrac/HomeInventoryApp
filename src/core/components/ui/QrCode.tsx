import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/core/lib/cn';

interface QrCodeProps {
  /** The string to encode (for locations, a `${publicAppUrl}/l/{slug}` URL). */
  value: string;
  /** Rendered size in pixels. Defaults to 160. */
  size?: number;
  /**
   * Accessible name for the code. Rendered as an SVG `<title>` so assistive tech
   * announces what the code points to rather than treating it as decoration.
   */
  title: string;
  className?: string | undefined;
}

/**
 * Thin wrapper around `qrcode.react` that renders an SVG QR code. SVG scales
 * crisply for both screen and print. The code is generated entirely on the
 * client; the backend never produces images.
 */
export function QrCode({ value, size = 160, title, className }: QrCodeProps) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      title={title}
      role="img"
      marginSize={2}
      className={cn('h-auto max-w-full', className)}
    />
  );
}
