import { encryptData, decryptData } from '@/utils/encryption';

const DB_NAME = 'lendswift_secure_vault';
const DB_VERSION = 1;
const STORE = 'encrypted_signatures';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'sessionId' });
      }
    };
  });
}

export interface SignatureVaultRecord {
  sessionId: string;
  encryptedPayload: string;
  savedAt: string;
  algorithm: 'AES-256-GCM';
}

/**
 * Encrypted signature vault — simulates secure database persistence (IndexedDB + AES-256).
 * Production would POST encrypted payload to server-side vault / Netlify DB.
 */
export async function saveSignatureToVault(
  sessionId: string,
  signatureDataUrl: string,
): Promise<SignatureVaultRecord> {
  const encryptedPayload = await encryptData(signatureDataUrl);
  const record: SignatureVaultRecord = {
    sessionId,
    encryptedPayload,
    savedAt: new Date().toISOString(),
    algorithm: 'AES-256-GCM',
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();

  return record;
}

export async function loadSignatureFromVault(sessionId: string): Promise<string | null> {
  const db = await openDb();
  const record = await new Promise<SignatureVaultRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(sessionId);
    req.onsuccess = () => resolve(req.result as SignatureVaultRecord | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();

  if (!record?.encryptedPayload) return null;

  try {
    return await decryptData(record.encryptedPayload);
  } catch {
    return null;
  }
}

export async function deleteSignatureFromVault(sessionId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(sessionId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function getOrCreateSignatureSessionId(existing?: string): string {
  if (existing) return existing;
  return crypto.randomUUID();
}
