import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { TrashIcon } from '@/core/components/icons';
import { useObjectUrl } from '@/core/hooks/useObjectUrl';
import { useUploadItemPhoto } from '@features/Items/hooks/useUploadItemPhoto';
import { useDeleteItemPhoto } from '@features/Items/hooks/useDeleteItemPhoto';
import { getItemErrorMessage } from '@features/Items/lib/itemErrors';
import { ItemPhotoInput } from '@features/Items/components/ItemPhotoInput';
import type { Item } from '@features/Items/types';

interface ItemPhotoManagerProps {
  /** The item whose photo is being managed (needs `id` and `photoUrl`). */
  item: Pick<Item, 'id' | 'name' | 'photoUrl'>;
}

/**
 * Photo section for an existing item: shows the current photo (or a
 * placeholder), lets the user pick a new one, preview it and confirm the
 * upload, and remove the existing photo behind a confirmation. Uploading or
 * deleting invalidates the item so a fresh presigned URL is fetched.
 */
export function ItemPhotoManager({ item }: ItemPhotoManagerProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const upload = useUploadItemPhoto(item.id);
  const remove = useDeleteItemPhoto(item.id);

  const stagedPreview = useObjectUrl(selectedFile);
  const previewUrl = stagedPreview ?? item.photoUrl;
  const isBusy = upload.isPending || remove.isPending;

  function confirmUpload() {
    if (!selectedFile) {
      return;
    }
    upload.mutate(selectedFile, {
      onSuccess: () => setSelectedFile(null),
    });
  }

  return (
    <div className="space-y-3">
      <ItemPhotoInput
        id={inputId}
        previewUrl={previewUrl}
        onSelect={setSelectedFile}
        error={upload.isError ? getItemErrorMessage(upload.error) : null}
        disabled={isBusy}
      />

      {selectedFile ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSelectedFile(null)}
            disabled={upload.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={confirmUpload}
            isLoading={upload.isPending}
          >
            {upload.isPending ? t('photo.uploading') : t('photo.uploadPhotoBtn')}
          </Button>
        </div>
      ) : item.photoUrl ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isBusy}
          >
            <TrashIcon className="size-4" />
            {t('photo.removePhoto')}
          </Button>
        </div>
      ) : null}

      {remove.isError ? (
        <Alert tone="error">{getItemErrorMessage(remove.error)}</Alert>
      ) : null}

      {isConfirmingDelete ? (
        <Dialog
          open
          role="alertdialog"
          onClose={() => setIsConfirmingDelete(false)}
          title={t('photo.removePhotoTitle')}
          description={t('photo.removePhotoDescription', { name: item.name })}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={remove.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
                isLoading={remove.isPending}
                onClick={() =>
                  remove.mutate(undefined, {
                    onSuccess: () => setIsConfirmingDelete(false),
                  })
                }
              >
                {remove.isPending ? t('photo.removing') : t('photo.removePhoto')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            {t('photo.removePhotoConfirm')}
          </p>
        </Dialog>
      ) : null}
    </div>
  );
}
