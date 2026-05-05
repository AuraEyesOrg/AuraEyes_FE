import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';

type RoleName = 'Patient' | 'Ophthalmologist' | 'OrgAdmin' | 'SystemAdmin';

type StoredAuthPayload = {
  accessToken: string;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    contractStatus?: string | null;
  };
};

const roleToFileName: Record<RoleName, string> = {
  Patient: 'patient.json',
  Ophthalmologist: 'ophthalmologist.json',
  OrgAdmin: 'org-admin.json',
  SystemAdmin: 'system-admin.json',
};

async function readRoleAuth(roleName: RoleName): Promise<StoredAuthPayload> {
  const authFilePath = path.resolve('tests/.auth', roleToFileName[roleName]);
  const raw = await fs.readFile(authFilePath, 'utf-8');
  return JSON.parse(raw) as StoredAuthPayload;
}

export async function injectAuthState(
  page: Page,
  roleName: RoleName,
): Promise<void> {
  const auth = await readRoleAuth(roleName);
  const normalizedUser = {
    ...auth.user,
    // Keep ophthalmologist test sessions inside protected routes instead of
    // being redirected to contract/onboarding gates during UI E2E checks.
    contractStatus:
      auth.user.roles.includes('Ophthalmologist')
        ? (auth.user.contractStatus ?? 'Active')
        : auth.user.contractStatus,
  };

  await page.evaluate((payload: StoredAuthPayload) => {
    window.localStorage.setItem('token', JSON.stringify(payload.accessToken));
    window.localStorage.setItem(
      'refreshToken',
      JSON.stringify(payload.refreshToken),
    );
    window.localStorage.setItem('user', JSON.stringify(payload.user));
  }, { ...auth, user: normalizedUser });
}
