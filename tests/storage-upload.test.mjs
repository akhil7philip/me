import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const editPage = 'app/admin/(dashboard)/articles/[id]/edit/edit-article-page.tsx';
const newPage = 'app/admin/(dashboard)/articles/new/page.tsx';
const storageMigration = 'supabase/migrations/20261101_storage_media_policies.sql';

test('article image upload pages use the cookie-backed Supabase client', async () => {
  for (const page of [editPage, newPage]) {
    const source = await readFile(page, 'utf8');
    assert.match(source, /import \{ createBrowserClient \} from '@supabase\/ssr'/);
    assert.doesNotMatch(source, /createClient \} from '@supabase\/supabase-js'/);
    assert.match(source, /\.storage\s*\.from\('media'\)\s*\.upload\(filePath, file\)/s);
    assert.match(source, /const filePath = `\$\{user\.id\}\//);
  }
});

test('media storage policies require a matching authenticated user folder', async () => {
  const sql = await readFile(storageMigration, 'utf8');
  assert.match(sql, /INSERT INTO storage\.buckets/);
  assert.match(sql, /ON storage\.objects FOR INSERT TO authenticated/);
  assert.match(sql, /ON storage\.objects FOR UPDATE TO authenticated/);
  assert.match(sql, /ON storage\.objects FOR DELETE TO authenticated/);
  assert.match(sql, /storage\.foldername\(name\)\)\[1\] = \(SELECT auth\.uid\(\)::text\)/);
});
