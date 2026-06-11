import { describe, it, expect } from 'vitest';
import {
  buildLocationUrl,
  extractSlugFromScan,
  locationSlugPath,
} from '@features/Qr/lib/locationUrl';

describe('locationSlugPath', () => {
  it('builds the deep-link path for a slug', () => {
    expect(locationSlugPath('box-3')).toBe('/l/box-3');
  });
});

describe('buildLocationUrl', () => {
  it('prefixes the public app url (jsdom origin) to the slug path', () => {
    // In tests `publicAppUrl` falls back to the jsdom window origin.
    expect(buildLocationUrl('box-3')).toBe(`${window.location.origin}/l/box-3`);
  });
});

describe('extractSlugFromScan', () => {
  it('extracts the slug from a full deep-link URL', () => {
    expect(extractSlugFromScan('https://home.example/l/box-3')).toBe('box-3');
  });

  it('extracts the slug from a bare path', () => {
    expect(extractSlugFromScan('/l/kitchen-pantry')).toBe('kitchen-pantry');
  });

  it('tolerates a trailing slash, query and hash', () => {
    expect(extractSlugFromScan('https://home.example/l/box-3/')).toBe('box-3');
    expect(extractSlugFromScan('https://home.example/l/box-3?ref=qr')).toBe(
      'box-3',
    );
    expect(extractSlugFromScan('/l/box-3#top')).toBe('box-3');
  });

  it('decodes percent-encoded slugs', () => {
    expect(extractSlugFromScan('/l/box%203')).toBe('box 3');
  });

  it('returns null for unrelated payloads', () => {
    expect(extractSlugFromScan('https://home.example/items/abc')).toBeNull();
    expect(extractSlugFromScan('just some text')).toBeNull();
    expect(extractSlugFromScan('')).toBeNull();
  });
});
