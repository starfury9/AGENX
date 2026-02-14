// ============================================================
// AGENX — Sui Blockchain Client
// Handles on-chain operations: reading objects, executing txs
// ============================================================

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

// ── Configuration ────────────────────────────────────────────

const NETWORK = (process.env.SUI_NETWORK as 'testnet' | 'devnet' | 'mainnet') || 'testnet';
const PACKAGE_ID = process.env.SUI_PACKAGE_ID || '';
const ADMIN_SECRET = process.env.SUI_ADMIN_SECRET_KEY || '';

// ── Client Singleton ─────────────────────────────────────────

let client: SuiClient | null = null;

export function getSuiClient(): SuiClient {
  if (!client) {
    client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
    console.log(`[SUI] Connected to ${NETWORK}: ${getFullnodeUrl(NETWORK)}`);
  }
  return client;
}

// ── Keypair ──────────────────────────────────────────────────

export function getAdminKeypair(): Ed25519Keypair | null {
  if (!ADMIN_SECRET) {
    console.warn('[SUI] No admin secret key configured — on-chain txs disabled');
    return null;
  }
  try {
    return Ed25519Keypair.fromSecretKey(ADMIN_SECRET);
  } catch {
    console.warn('[SUI] Invalid admin secret key format');
    return null;
  }
}

// ── Transaction Helpers ──────────────────────────────────────

export async function executeTransaction(tx: Transaction): Promise<string | null> {
  const keypair = getAdminKeypair();
  if (!keypair) return null;

  try {
    const result = await getSuiClient().signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log(`[SUI] Tx executed: ${result.digest}`);
    return result.digest;
  } catch (err: any) {
    console.error('[SUI] Tx failed:', err.message);
    return null;
  }
}

// ── Object Queries ───────────────────────────────────────────

export async function getObject(objectId: string) {
  try {
    return await getSuiClient().getObject({
      id: objectId,
      options: { showContent: true, showOwner: true },
    });
  } catch {
    return null;
  }
}

export async function getOwnedObjects(address: string) {
  try {
    const result = await getSuiClient().getOwnedObjects({
      owner: address,
      options: { showContent: true },
    });
    return result.data;
  } catch {
    return [];
  }
}

// ── Balance ──────────────────────────────────────────────────

export async function getSuiBalance(address: string): Promise<number> {
  try {
    const balance = await getSuiClient().getBalance({ owner: address });
    return Number(balance.totalBalance);
  } catch {
    return 0;
  }
}

// ── Exports for route handlers ───────────────────────────────

export { NETWORK, PACKAGE_ID };
