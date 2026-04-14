export interface UserAvatarMeta {
  displayName: string;
  initials: string;
}

export interface AvatarSource {
  avatarUrl?: string | null;
  uploadedAvatarUrl?: string | null;
  providerAvatarUrl?: string | null;
}

export function resolveAvatarUrl(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const candidate of candidates) {
    const normalized = (candidate ?? '').trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return undefined;
}

export function resolvePreferredAvatarUrl(
  ...sources: Array<AvatarSource | null | undefined>
): string | undefined {
  for (const source of sources) {
    if (!source) continue;

    const uploadedAvatarUrl = resolveAvatarUrl(source.uploadedAvatarUrl);
    if (uploadedAvatarUrl) {
      return uploadedAvatarUrl;
    }

    const providerAvatarUrl = resolveAvatarUrl(source.providerAvatarUrl);
    if (providerAvatarUrl) {
      return providerAvatarUrl;
    }

    const avatarUrl = resolveAvatarUrl(source.avatarUrl);
    if (avatarUrl) {
      return avatarUrl;
    }
  }

  return undefined;
}

function normalizeWords(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

export function getUserAvatarMeta(
  fullName: string | null | undefined,
  fallbackName = 'User'
): UserAvatarMeta {
  const safeName = (fullName || '').trim() || fallbackName;
  const words = normalizeWords(safeName);
  const lastTwoWords = words.slice(-2);

  let initials = lastTwoWords
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  if (!initials) {
    initials = safeName.slice(0, 2).toUpperCase();
  }

  return {
    displayName: safeName,
    initials: initials || fallbackName.slice(0, 2).toUpperCase(),
  };
}
