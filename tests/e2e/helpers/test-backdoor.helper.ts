import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRequestContext } from '@playwright/test';

type RoleName = 'Patient' | 'Ophthalmologist' | 'OrgAdmin' | 'SystemAdmin';

type AuthFixture = {
  accessToken: string;
  tokenType?: string;
  refreshToken?: string | null;
  expiresAt?: string;
  user: {
    id: string;
    email?: string;
    fullName?: string;
    roles?: string[];
    roleId?: string | null;
    emailConfirmed?: boolean;
    twoFactorEnabled?: boolean;
  };
};

type MagicLoginResponse = {
  success: boolean;
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
};

type JwtPayload = {
  profile_id?: string;
};

const roleToFileName: Record<RoleName, string> = {
  Patient: 'patient.json',
  Ophthalmologist: 'ophthalmologist.json',
  OrgAdmin: 'org-admin.json',
  SystemAdmin: 'system-admin.json',
};

const roleToEmail: Record<RoleName, string> = {
  Patient: process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com',
  Ophthalmologist:
    process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com',
  OrgAdmin: process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com',
  SystemAdmin:
    process.env.E2E_ROLE_EMAIL_SYSTEM_ADMIN ?? 'systemadmin@gmail.com',
};

function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length < 2) {
    return {};
  }

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')) as JwtPayload;
  } catch {
    return {};
  }
}

async function magicLogin(
  request: APIRequestContext,
  email: string,
): Promise<MagicLoginResponse> {
  const response = await request.get(
    `${getApiBaseUrl()}/api/test-backdoor/auth/magic-login?email=${encodeURIComponent(email)}`,
    {
      headers: {
        'X-Test-Key': getBackdoorKey(),
      },
    },
  );

  if (!response.ok()) {
    throw new Error(`magic-login failed for ${email}: ${response.status()} ${await response.text()}`);
  }

  return (await response.json()) as MagicLoginResponse;
}

async function refreshAuthFixtures(request: APIRequestContext): Promise<void> {
  const authDir = path.resolve('tests/.auth');
  await fs.mkdir(authDir, { recursive: true });

  const roles = Object.keys(roleToFileName) as RoleName[];
  for (const role of roles) {
    const email = roleToEmail[role];
    const loginResult = await magicLogin(request, email);
    const jwtPayload = parseJwtPayload(loginResult.accessToken);

    if (!loginResult.success || !loginResult.accessToken) {
      throw new Error(`magic-login returned invalid payload for ${email}.`);
    }

    const fixture: AuthFixture = {
      accessToken: loginResult.accessToken,
      tokenType: loginResult.tokenType,
      refreshToken: null,
      expiresAt: loginResult.expiresAt,
      user: {
        ...loginResult.user,
        roleId: jwtPayload.profile_id ?? null,
        emailConfirmed: true,
        twoFactorEnabled: false,
      },
    };

    await fs.writeFile(
      path.join(authDir, roleToFileName[role]),
      JSON.stringify(fixture, null, 2),
      'utf-8',
    );
  }
}

export function getApiBaseUrl(): string {
  return process.env.E2E_API_BASE_URL ?? 'http://localhost:5101';
}

export function getBackdoorKey(): string {
  const key = process.env.E2E_BACKDOOR_KEY;
  if (!key) {
    throw new Error('E2E_BACKDOOR_KEY is required for backdoor API calls.');
  }

  return key;
}

export async function resetAndSeed(request: APIRequestContext): Promise<void> {
  const response = await request.post(
    `${getApiBaseUrl()}/api/test-backdoor/reset-and-seed`,
    {
      headers: {
        'X-Test-Key': getBackdoorKey(),
      },
    },
  );

  if (!response.ok()) {
    throw new Error(
      `reset-and-seed failed: ${response.status()} ${await response.text()}`,
    );
  }

  await refreshAuthFixtures(request);
}

export async function readAuthFixture(roleName: RoleName): Promise<AuthFixture> {
  const authFilePath = path.resolve('tests/.auth', roleToFileName[roleName]);
  const raw = await fs.readFile(authFilePath, 'utf-8');
  return JSON.parse(raw) as AuthFixture;
}
