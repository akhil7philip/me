import assert from 'node:assert/strict';
import test from 'node:test';
import { getPublishedArticle, publicArticleSelection } from '../lib/public-content.ts';

test('public article API queries always limit results to published articles', async () => {
  const calls = [];
  const expected = { id: 'article-id', slug: 'human-in-the-loop', status: 'published' };
  const client = {
    from(table) {
      calls.push(['from', table]);
      return this;
    },
    select(columns) {
      calls.push(['select', columns]);
      return this;
    },
    eq(column, value) {
      calls.push(['eq', column, value]);
      return this;
    },
    single() {
      return Promise.resolve({ data: expected, error: null });
    },
  };

  const result = await getPublishedArticle(client, 'human-in-the-loop');

  assert.deepEqual(result, { data: expected, error: null });
  assert.deepEqual(calls, [
    ['from', 'articles'],
    ['select', publicArticleSelection],
    ['eq', 'slug', 'human-in-the-loop'],
    ['eq', 'status', 'published'],
  ]);
});
