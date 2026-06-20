const MAX_WIDTH = 1200;
const TARGET_MAX_BYTES = 2 * 1024 * 1024;
const INITIAL_QUALITY = 0.7;
const MIN_QUALITY = 0.3;

export async function compressImage(file: File): Promise<{ blob: Blob; originalSize: number }> {
  const originalSize = file.size;

  if (!file.type.startsWith('image/')) {
    return { blob: file, originalSize };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: file, originalSize };

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = INITIAL_QUALITY;
  let blob = await canvasToJpeg(canvas, quality);

  while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    blob = await canvasToJpeg(canvas, quality);
  }

  return { blob, originalSize };
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
      'image/jpeg',
      quality,
    );
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fileToStoredDocument(file: File): Promise<{
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  size: number;
  mimeType: string;
}> {
  const { blob, originalSize } = await compressImage(file);
  const dataUrl = await blobToDataUrl(blob);
  return {
    blob,
    dataUrl,
    originalSize,
    size: blob.size,
    mimeType: blob.type || file.type,
  };
}
