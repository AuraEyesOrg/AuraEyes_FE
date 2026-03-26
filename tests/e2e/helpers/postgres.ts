import { Pool, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
let pool: Pool | null = null;

function parseKeyValueConnectionString(raw: string): {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
} {
  const segments = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  const map: Record<string, string> = {};
  for (const segment of segments) {
    const separatorIndex = segment.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = segment.slice(0, separatorIndex).trim().toLowerCase();
    const value = segment.slice(separatorIndex + 1).trim();
    map[key] = value;
  }

  const parsedPort = Number(map.port);

  return {
    host: map.host,
    port: Number.isFinite(parsedPort) ? parsedPort : undefined,
    database: map.database,
    user: map.username ?? map.user,
    password: map.password,
  };
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const cs =
    process.env.E2E_DB_CONNECTION_STRING ||
    'postgresql://postgres:0977452762Viet@127.0.0.1:5432/auraeyes_test';

  const isUrlFormat = /^postgres(ql)?:\/\//i.test(cs.trim());

  if (isUrlFormat) {
    pool = new Pool({
      connectionString: cs,
      ssl: false,
    });
    return pool;
  }

  const kv = parseKeyValueConnectionString(cs);

  pool = new Pool({
    host: kv.host,
    port: kv.port,
    database: kv.database,
    user: kv.user,
    password: kv.password,
    ssl: false,
  });
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

export async function closeDb(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
