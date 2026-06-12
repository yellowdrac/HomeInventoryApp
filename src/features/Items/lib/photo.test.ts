import { describe, it, expect } from 'vitest';
import {
  MAX_PHOTO_SIZE_BYTES,
  validatePhotoFile,
} from '@features/Items/lib/photo';

/** Builds a File of the given type and size without allocating real bytes. */
function fakeFile(type: string, size: number): File {
  const file = new File(['x'], 'photo', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validatePhotoFile', () => {
  it('accepts the allowed image types within the size limit', () => {
    expect(validatePhotoFile(fakeFile('image/jpeg', 1024))).toBeNull();
    expect(validatePhotoFile(fakeFile('image/png', 1024))).toBeNull();
    expect(validatePhotoFile(fakeFile('image/webp', 1024))).toBeNull();
  });

  it('rejects unsupported content types', () => {
    expect(validatePhotoFile(fakeFile('image/gif', 1024))).toMatch(
      /unsupported image type/i,
    );
    expect(validatePhotoFile(fakeFile('application/pdf', 1024))).toMatch(
      /unsupported image type/i,
    );
  });

  it('rejects files larger than the maximum size', () => {
    expect(
      validatePhotoFile(fakeFile('image/png', MAX_PHOTO_SIZE_BYTES + 1)),
    ).toMatch(/too large/i);
  });

  it('accepts a file exactly at the size limit', () => {
    expect(
      validatePhotoFile(fakeFile('image/jpeg', MAX_PHOTO_SIZE_BYTES)),
    ).toBeNull();
  });
});
