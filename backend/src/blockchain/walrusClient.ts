// ============================================================
// AGENX — Walrus Decentralized Storage Client
// Stores and retrieves blobs (messages, bios, task data)
// ============================================================

const WALRUS_PUBLISHER = process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR = process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

export interface WalrusStoreResult {
  blobId: string;
  success: boolean;
  error?: string;
}

// ── Store a blob on Walrus ───────────────────────────────────

export async function storeOnWalrus(data: string | object): Promise<WalrusStoreResult> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);

  try {
    const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      return {
        blobId: '',
        success: false,
        error: `Walrus returned ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json() as any;

    // Walrus returns either newlyCreated or alreadyCertified
    const blobId =
      result?.newlyCreated?.blobObject?.blobId ||
      result?.alreadyCertified?.blobId ||
      '';

    if (!blobId) {
      return { blobId: '', success: false, error: 'No blobId in response' };
    }

    console.log(`[WALRUS] Stored blob: ${blobId}`);
    return { blobId, success: true };
  } catch (err: any) {
    console.error('[WALRUS] Store failed:', err.message);
    return { blobId: '', success: false, error: err.message };
  }
}

// ── Retrieve a blob from Walrus ──────────────────────────────

export async function readFromWalrus(blobId: string): Promise<string | null> {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);

    if (!response.ok) {
      console.error(`[WALRUS] Read failed: ${response.status}`);
      return null;
    }

    const text = await response.text();
    console.log(`[WALRUS] Read blob: ${blobId} (${text.length} bytes)`);
    return text;
  } catch (err: any) {
    console.error('[WALRUS] Read failed:', err.message);
    return null;
  }
}

// ── Parse JSON blob ──────────────────────────────────────────

export async function readJsonFromWalrus<T = unknown>(blobId: string): Promise<T | null> {
  const text = await readFromWalrus(blobId);
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error('[WALRUS] Failed to parse JSON blob');
    return null;
  }
}
