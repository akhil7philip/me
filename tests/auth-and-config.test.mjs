import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('protected admin pages mount a browser-cookie auth provider', async () => {
  const [layout, authContext] = await Promise.all([
    readFile(new URL('../app/admin/(dashboard)/layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../lib/auth-context.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(layout, /<AuthProvider>/);
  assert.match(authContext, /createBrowserClient/);
  assert.doesNotMatch(authContext, /import \{ createClient \} from '@supabase\/supabase-js';/);
});

test('browser configuration uses a publishable key only', async () => {
  const [exampleEnv, client] = await Promise.all([
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
    readFile(new URL('../lib/supabase.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(exampleEnv, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/m);
  assert.doesNotMatch(exampleEnv, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(client, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(client, /SERVICE_ROLE|SUPABASE_SECRET_KEY/);
});
