import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Vercel deployment keeps dynamic routes available after a build', async () => {
  const [nextConfig, articleRoute, seriesRoute, adminEditRoute] = await Promise.all([
    readFile(new URL('../next.config.js', import.meta.url), 'utf8'),
    readFile(new URL('../app/articles/[id]/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/series/[slug]/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/admin/(dashboard)/articles/[id]/edit/page.tsx', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(nextConfig, /output:\s*['"]export['"]/);
  assert.match(articleRoute, /export const dynamicParams = true/);
  assert.match(seriesRoute, /export const dynamicParams = true/);
  assert.match(adminEditRoute, /export const dynamicParams = true/);
});
