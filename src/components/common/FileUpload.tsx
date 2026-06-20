import { useCallback, useId, useState } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileToStoredDocument, formatFileSize } from '@/utils/imageCompression';
import type { StoredDocument } from '@/utils/documentRequirements';

interface FileUploadProps {
  label: string;
  accept: Accept;
  maxSizeMb: number;
  value: StoredDocument | null;
  onChange: (doc: StoredDocument | null) => void;
  optional?: boolean;
  optionalReason?: string;
}

export function FileUpload({
  label,
  accept,
  maxSizeMb,
  value,
  onChange,
  optional,
  optionalReason,
}: FileUploadProps) {
  const fieldId = useId();
  const labelId = `${fieldId}-label`;
  const hintId = `${fieldId}-hint`;
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setError(null);

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMb} MB limit`);
        return;
      }

      setIsProcessing(true);
      try {
        const processed = await fileToStoredDocument(file);
        const doc: StoredDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: processed.mimeType,
          size: processed.size,
          originalSize: processed.originalSize,
          preview: processed.mimeType.startsWith('image/') ? processed.dataUrl : undefined,
          dataUrl: processed.dataUrl,
        };
        onChange(doc);
      } catch {
        setError('Failed to process file. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [maxSizeMb, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => void onDrop(files),
    accept,
    maxFiles: 1,
    multiple: false,
    noClick: !!value,
  });

  if (value) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {label}
            {!optional && <span className="text-lendswift-error ml-0.5">*</span>}
          </span>
          {optional && optionalReason && (
            <span className="text-xs text-lendswift-accent">Optional — {optionalReason}</span>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-lendswift-accent/30 bg-lendswift-accent/5 p-3">
          {value.preview ? (
            <img src={value.preview} alt={`Preview of ${value.name}`} className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
              <FileText className="h-6 w-6 text-lendswift-primary" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(value.size)}
              {value.originalSize !== value.size && (
                <span className="text-lendswift-accent">
                  {' '}
                  (compressed from {formatFileSize(value.originalSize)})
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span id={labelId} className="text-sm font-medium">
        {label}
        {!optional && <span className="text-lendswift-error ml-0.5">*</span>}
        {!optional && <span className="sr-only"> (required)</span>}
      </span>
      {optional && optionalReason && (
        <p id={hintId} className="text-xs text-muted-foreground">{optionalReason}</p>
      )}
      <div
        {...getRootProps({
          'aria-label': `Upload ${label}`,
          ...(optional && optionalReason ? { 'aria-describedby': hintId } : {}),
        })}
        className={cn(
          'dropzone-breathe flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors',
          isDragActive ? 'border-lendswift-primary bg-lendswift-primary/5' : 'border-border hover:border-lendswift-primary/50',
          isProcessing && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps({ tabIndex: -1, 'aria-hidden': true })} />
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-lendswift-primary" aria-hidden="true" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-muted-foreground">Max {maxSizeMb} MB</p>
      </div>
      {error && (
        <p className="text-xs text-lendswift-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
