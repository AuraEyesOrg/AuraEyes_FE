import type { AuthorType } from '../types';

export function resolveAuthorType(
  roles: string[] | null | undefined,
  fallback: AuthorType = 'Ophthalmologist'
): AuthorType {
  if (!roles || roles.length === 0) {
    return fallback;
  }

  if (roles.includes('OrgAdmin')) {
    return 'Organisation';
  }

  if (roles.includes('Ophthalmologist')) {
    return 'Ophthalmologist';
  }

  return fallback;
}
