import type { ElectionInput, SystemId } from '@/lib/electoral';

const PREFIX_COMPRESSED = 'c1';
const PREFIX_PLAIN = 'p1';

function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const SYSTEM_IDS: SystemId[] = [
  'plurality',
  'runoff',
  'irv',
  'condorcet',
  'borda',
  'approval',
  'score',
];

function isValidShape(value: unknown): value is ElectionInput {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.candidates) &&
    Array.isArray(v.blocs) &&
    typeof v.system === 'string' &&
    SYSTEM_IDS.includes(v.system as SystemId) &&
    typeof v.seats === 'number' &&
    (v.voterMode === 'individual' || v.voterMode === 'blocs')
  );
}

export async function encodeScenario(input: ElectionInput): Promise<string> {
  const json = JSON.stringify(input);
  const bytes = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'function') {
    return PREFIX_COMPRESSED + base64url(await deflate(bytes));
  }
  return PREFIX_PLAIN + base64url(bytes);
}

export async function decodeScenario(
  code: string,
): Promise<ElectionInput | null> {
  try {
    let bytes: Uint8Array;
    if (code.startsWith(PREFIX_COMPRESSED)) {
      if (typeof DecompressionStream !== 'function') return null;
      bytes = await inflate(base64urlDecode(code.slice(PREFIX_COMPRESSED.length)));
    } else if (code.startsWith(PREFIX_PLAIN)) {
      bytes = base64urlDecode(code.slice(PREFIX_PLAIN.length));
    } else {
      return null;
    }
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    return isValidShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
