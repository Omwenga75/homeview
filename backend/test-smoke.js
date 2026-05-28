const assert = require('node:assert/strict');

async function main() {
  const base = 'http://127.0.0.1:8000';

  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@homeview.com', password: 'admin123' })
  });
  const loginJson = await loginRes.json();
  console.log('LOGIN_STATUS', loginRes.status);
  console.log('LOGIN_JSON', JSON.stringify(loginJson).slice(0, 300));
  assert.equal(loginRes.status, 200, 'Admin login should succeed');
  assert.equal(loginJson.success, true, 'Admin login should return success');

  const housesRes = await fetch(base + '/houses');
  const housesJson = await housesRes.json();
  console.log('HOUSES_STATUS', housesRes.status, 'COUNT', Array.isArray(housesJson) ? housesJson.length : 'n/a');
  assert.equal(housesRes.status, 200, 'Listings endpoint should succeed');
  assert.ok(Array.isArray(housesJson), 'Listings should return an array');

  const createRes = await fetch(base + '/houses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Smoke Test House',
      location: 'Nairobi',
      price: 9999,
      description: 'Smoke test house',
      owner_name: 'QA',
      owner_email: 'qa@example.com',
      photo_urls: '[]'
    })
  });
  const createJson = await createRes.json();
  console.log('CREATE_STATUS', createRes.status, 'ID', createJson.id || 'n/a');
  assert.equal(createRes.status, 201, 'House creation should succeed');
  assert.ok(createJson.id, 'House creation should return an ID');

  console.log('SMOKE_TESTS_PASSED');
}

main().catch((err) => {
  console.error('SMOKE_TESTS_FAILED', err);
  process.exitCode = 1;
});
