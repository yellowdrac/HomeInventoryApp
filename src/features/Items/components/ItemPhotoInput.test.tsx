import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemPhotoInput } from '@features/Items/components/ItemPhotoInput';
import { MAX_PHOTO_SIZE_BYTES } from '@features/Items/lib/photo';

/** Returns the (visually hidden) file input rendered by the control. */
function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

function imageFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('ItemPhotoInput', () => {
  it('renders a preview when a previewUrl is provided', () => {
    render(
      <ItemPhotoInput
        id="p"
        previewUrl="https://example.com/photo.png"
        onSelect={() => {}}
      />,
    );

    const preview = screen.getByAltText('Item photo preview') as HTMLImageElement;
    expect(preview).toBeInTheDocument();
    expect(preview.src).toBe('https://example.com/photo.png');
  });

  it('shows the upload affordance and no image when there is no preview', () => {
    render(<ItemPhotoInput id="p" previewUrl={null} onSelect={() => {}} />);

    expect(screen.getByText('Upload a photo')).toBeInTheDocument();
    expect(screen.queryByAltText('Item photo preview')).not.toBeInTheDocument();
  });

  it('rejects an oversized image and does not select it', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ItemPhotoInput id="p" previewUrl={null} onSelect={onSelect} />,
    );

    await user.upload(
      fileInput(container),
      imageFile('big.png', 'image/png', MAX_PHOTO_SIZE_BYTES + 1),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects a valid image', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ItemPhotoInput id="p" previewUrl={null} onSelect={onSelect} />,
    );

    const file = imageFile('ok.png', 'image/png', 1024);
    await user.upload(fileInput(container), file);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
