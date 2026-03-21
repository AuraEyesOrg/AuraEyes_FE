import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

type RoleAuthConfig = {
  role: 'Patient' | 'Ophthalmologist' | 'OrgAdmin' | 'SystemAdmin';
  email: string;
  fileName: string;
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

const baseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:5101';
const testBackdoorKey = process.env.E2E_BACKDOOR_KEY;

const roleAuthConfigs: RoleAuthConfig[] = [
  {
    role: 'Patient',
    email: process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com',
    fileName: 'patient.json',
  },
  {
    role: 'Ophthalmologist',
    email:
      process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com',
    fileName: 'ophthalmologist.json',
  },
  {
    role: 'OrgAdmin',
    email: process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com',
    fileName: 'org-admin.json',
  },
  {
    role: 'SystemAdmin',
    email: process.env.E2E_ROLE_EMAIL_SYSTEM_ADMIN ?? 'systemadmin@gmail.com',
    fileName: 'system-admin.json',
  },
];

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
    return JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    ) as JwtPayload;
  } catch {
    return {};
  }
}

async function magicLogin(email: string): Promise<MagicLoginResponse> {
  if (!testBackdoorKey) {
    throw new Error('E2E_BACKDOOR_KEY is required for magic-login setup.');
  }

  const url = new URL('/api/test-backdoor/auth/magic-login', baseUrl);
  url.searchParams.set('email', email);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Test-Key': testBackdoorKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Magic login failed for ${email}: ${response.status} ${body}`
    );
  }

  return (await response.json()) as MagicLoginResponse;
}

export default async function globalSetup(): Promise<void> {
  const authDir = path.resolve('tests/.auth');
  await fs.mkdir(authDir, { recursive: true });

  for (const config of roleAuthConfigs) {
    const loginResult = await magicLogin(config.email);
    const jwtPayload = parseJwtPayload(loginResult.accessToken);

    if (!loginResult.success || !loginResult.accessToken) {
      throw new Error(
        `Magic login returned invalid payload for ${config.email}.`
      );
    }

    await fs.writeFile(
      path.join(authDir, config.fileName),
      JSON.stringify(
        {
          role: config.role,
          email: config.email,
          tokenType: loginResult.tokenType,
          accessToken: loginResult.accessToken,
          refreshToken: null,
          expiresAt: loginResult.expiresAt,
          user: {
            ...loginResult.user,
            roleId: jwtPayload.profile_id ?? null,
            emailConfirmed: true,
            twoFactorEnabled: false,
          },
        },
        null,
        2
      ),
      'utf-8'
    );
  }
}
