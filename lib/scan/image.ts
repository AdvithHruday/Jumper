import { MAX_PHOTO_BYTES } from './types';

/**
 * Shrinks a photo in the browser before it is sent. This keeps uploads small
 * and fast, and because the image is redrawn on a canvas and re-encoded, EXIF
 * data (including GPS location) is not carried over.
 */

const MAX_EDGE = 1568; // larger than this gives the model no extra detail

export class UnsupportedImageError extends Error {}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Most often a HEIC photo on a browser that cannot decode it.
    throw new UnsupportedImageError('This photo format is not supported. Try a JPEG or PNG.');
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new UnsupportedImageError('Could not process this photo.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.7, 0.55]) {
    const blob = await toBlob(canvas, quality);
    if (blob && blob.size <= MAX_PHOTO_BYTES) return blob;
  }
  throw new UnsupportedImageError('This photo is too large even after shrinking it. Try a smaller one.');
}
