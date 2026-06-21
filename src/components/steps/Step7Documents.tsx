import { Controller } from 'react-hook-form';
import { CheckCircle2, Circle } from 'lucide-react';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { FileUpload } from '@/components/common/FileUpload';
import { SignaturePad } from '@/components/common/SignaturePad';
import { getRequiredDocuments, type DocumentKey, type StoredDocument } from '@/utils/documentRequirements';
import { cn } from '@/lib/utils';

export default function Step7Documents() {
  const theme = STEP_THEMES[6];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useLoanForm();

  const formSnapshot = watch();
  const requirements = getRequiredDocuments(formSnapshot);
  const documents = watch('documents');

  const uploadedCount = requirements.filter(
    (r) => r.required && documents[r.key],
  ).length;
  const requiredCount = requirements.filter((r) => r.required).length;

  const setDocument = (key: DocumentKey, doc: StoredDocument | null) => {
    setValue(`documents.${key}`, doc, { shouldDirty: true });
  };

  const docError = (key: DocumentKey) =>
    (errors.documents as Record<string, { message?: string }> | undefined)?.[key]?.message;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload required documents and sign with your pointer. Signature is AES-256 encrypted and stored in secure vault.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Document Checklist</span>
          <span className="text-lendswift-primary">
            {uploadedCount}/{requiredCount} required
          </span>
        </div>
        <ul className="space-y-1">
          {requirements.map((req) => {
            const done = !!documents[req.key];
            return (
              <li key={req.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-lendswift-accent" aria-hidden="true" />
                ) : (
                  <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className={cn(done && 'text-foreground')}>
                  {req.label}
                  {!req.required && ' (optional)'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-5">
        {requirements.map((req) => (
          <div key={req.key}>
            <FileUpload
              label={req.label}
              accept={req.accept}
              maxSizeMb={req.maxSizeMb}
              value={documents[req.key]}
              onChange={(doc) => setDocument(req.key, doc)}
              optional={!req.required}
              optionalReason={req.optionalReason}
            />
            {docError(req.key) && (
              <p className="mt-1 text-xs text-lendswift-error" role="alert">
                {docError(req.key)}
              </p>
            )}
          </div>
        ))}
      </div>

      <Controller
        name="eSignatureEncrypted"
        control={control}
        render={() => (
          <SignaturePad
            sessionId={watch('signatureSessionId')}
            onSessionId={(id) => setValue('signatureSessionId', id)}
            encryptedSignature={watch('eSignatureEncrypted')}
            signaturePreview={watch('eSignaturePreview')}
            signatureSavedAt={watch('eSignatureSavedAt')}
            onSignatureSaved={({ encryptedSignature, preview, savedAt }) => {
              setValue('eSignatureEncrypted', encryptedSignature, { shouldDirty: true });
              setValue('eSignaturePreview', preview, { shouldDirty: true });
              setValue('eSignatureSavedAt', savedAt, { shouldDirty: true });
            }}
            onClear={() => {
              setValue('eSignatureEncrypted', '');
              setValue('eSignaturePreview', '');
              setValue('eSignatureSavedAt', '');
            }}
            error={errors.eSignatureEncrypted?.message}
          />
        )}
      />
    </div>
  );
}
