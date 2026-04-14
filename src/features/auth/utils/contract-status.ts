const KNOWN_CONTRACT_STATUSES = new Set([
  'draft',
  'pendingsignature',
  'active',
  'expired',
  'terminated',
  'cancelled',
]);

function normalizeContractStatus(status?: string | null): string {
  if (typeof status !== 'string') return '';
  return status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');
}

export function shouldRedirectToContract(status?: string | null): boolean {
  const normalized = normalizeContractStatus(status);

  // Avoid forcing contract routes when profile data has not loaded yet.
  if (!normalized || !KNOWN_CONTRACT_STATUSES.has(normalized)) {
    return false;
  }

  return normalized !== 'active';
}
