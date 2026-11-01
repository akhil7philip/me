import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createSitePlaylist } from '../lib/site-music.ts';

test('creates one deduplicated playlist from article music', () => {
  const playlist = createSitePlaylist(
    [
      {
        music_playlist: [
          { link: 'https://music.example/one.mp3', song_name: 'One' },
          { link: 'https://music.example/two.mp3', song_name: 'Two' },
        ],
      },
      {
        music_playlist: [
          { link: 'https://music.example/one.mp3', song_name: 'One (updated)' },
          { link: '', song_name: 'Invalid' },
        ],
      },
      { music_playlist: null },
    ],
    () => 0
  );

  assert.deepEqual(playlist, [
    { link: 'https://music.example/two.mp3', song_name: 'Two' },
    { link: 'https://music.example/one.mp3', song_name: 'One (updated)' },
  ]);
});

test('article pages do not mount a second music player', async () => {
  const [articlePage, rootLayout] = await Promise.all([
    readFile(new URL('../app/articles/[id]/article-page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(articlePage, /ArticleMusicPlayer/);
  assert.match(rootLayout, /<SiteMusicPlayer\s*\/>/);
});
