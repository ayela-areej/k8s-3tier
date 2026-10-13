const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET /api/health returns status ok', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${base}/api/nothing`);
  assert.strictEqual(res.status, 404);
});
