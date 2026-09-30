/**
 * Atoms Cloud Object Storage helpers for image uploads.
 *
 * Per the storage guide, we NEVER persist presigned upload/download URLs in the
 * database. Instead we store a compact, self-describing reference:
 *
 *     storage://<bucket_name>/<object_key>
 *
 * At render time `resolveImageSrc` turns that reference into a fresh download
 * URL via `client.storage.getDownloadUrl`. Plain http(s) URLs (e.g. a link the
 * admin pasted manually, or legacy seed data) are passed through untouched.
 */

import { client } from './api';

/** Bucket used for all seller logos and product images. */
export const IMAGE_BUCKET = 'glowmarket-images';

const STORAGE_SCHEME = 'storage://';

/** Max upload size (bytes). Keeps uploads fast and previews responsive. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface StorageRef {
  bucketName: string;
  objectKey: string;
}

/** True when the value is a `storage://` reference rather than a plain URL. */
export function isStorageRef(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith(STORAGE_SCHEME);
}

/** Build the persisted reference string for a bucket + object key. */
export function buildStorageRef(objectKey: string, bucketName = IMAGE_BUCKET): string {
  return `${STORAGE_SCHEME}${bucketName}/${objectKey}`;
}

/** Split a `storage://bucket/key` reference back into its parts. */
export function parseStorageRef(value: string): StorageRef | null {
  if (!isStorageRef(value)) return null;
  const rest = value.slice(STORAGE_SCHEME.length);
  const slash = rest.indexOf('/');
  if (slash <= 0 || slash === rest.length - 1) return null;
  return { bucketName: rest.slice(0, slash), objectKey: rest.slice(slash + 1) };
}

/** Make a filename safe for use inside an object key. */
function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'image'}.${ext || 'jpg'}`;
}

/** Validate a user-selected file before uploading. Returns a Persian message. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'فقط فایل تصویری مجاز است (JPG، PNG، WebP)';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'حجم تصویر باید کمتر از ۵ مگابایت باشد';
  }
  return null;
}

/**
 * Upload an image file to the shared bucket.
 *
 * @param file   Browser File from an <input type="file">.
 * @param folder Logical folder inside the bucket, e.g. "products" | "sellers".
 * @returns The `storage://` reference to persist in the database.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const objectKey = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const result = await client.storage.upload({
    bucket_name: IMAGE_BUCKET,
    object_key: objectKey,
    file,
  });
  // `upload` returns the result directly (not wrapped in `.data`).
  const uploadedKey = (result as { object_key?: string })?.object_key || objectKey;
  return buildStorageRef(uploadedKey);
}

/** In-memory cache of resolved download URLs so grids don't re-request. */
const downloadUrlCache = new Map<string, string>();

/**
 * Turn a stored image value into something an <img> can render.
 * - `storage://bucket/key` → fresh presigned download URL
 * - `http(s)://...`        → returned unchanged
 * - empty / unusable       → null (caller renders the smart fallback)
 */
export async function resolveImageSrc(value?: string | null): Promise<string | null> {
  const raw = value?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;

  const ref = parseStorageRef(raw);
  if (!ref) return null;

  const cached = downloadUrlCache.get(raw);
  if (cached) return cached;

  try {
    const response = await client.storage.getDownloadUrl({
      bucket_name: ref.bucketName,
      object_key: ref.objectKey,
    });
    const url = response?.data?.download_url;
    if (typeof url === 'string' && url) {
      downloadUrlCache.set(raw, url);
      return url;
    }
    return null;
  } catch {
    return null;
  }
}