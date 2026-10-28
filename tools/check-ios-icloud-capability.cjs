'use strict';

// Read-only App Store Connect diagnostic. Never print credentials or tokens.
const crypto = require('node:crypto');

async function main() {
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const privateKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
  if (!keyId || !issuer || !privateKey) {
    console.log('Apple API credentials are not available to this workflow.');
    process.exitCode = 2;
    return;
  }
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
  const claims = b64({ iss: issuer, iat: now, exp: now + 300, aud: 'appstoreconnect-v1' });
  let token;
  try {
    const input = `${header}.${claims}`;
    const key = privateKey.replace(/\\n/g, '\n');
    const signature = crypto.sign('sha256', Buffer.from(input), { key, dsaEncoding: 'ieee-p1363' });
    token = `${input}.${signature.toString('base64url')}`;
  } catch (_) {
    console.log('Apple API credentials could not be used to sign a request.');
    process.exitCode = 2;
    return;
  }

  const query = new URL('https://api.appstoreconnect.apple.com/v1/bundleIds');
  query.searchParams.set('filter[identifier]', 'com.twoplayersnake.app');
  query.searchParams.set('include', 'bundleIdCapabilities');
  query.searchParams.set('limit[bundleIdCapabilities]', '50');
  let response;
  try {
    response = await fetch(query, { headers: { Authorization: `Bearer ${token}` }, redirect: 'error' });
  } catch (_) {
    console.log('Apple API is unreachable.');
    process.exitCode = 2;
    return;
  }
  if (!response.ok) {
    console.log(`Apple API read-only request failed with HTTP ${response.status}.`);
    process.exitCode = 2;
    return;
  }
  const body = await response.json();
  if (!Array.isArray(body.data) || body.data.length !== 1) {
    console.log('Expected exactly one registered game bundle ID; no conclusion about iCloud.');
    process.exitCode = 2;
    return;
  }
  const links = body.data[0].relationships?.bundleIdCapabilities;
  if (!Array.isArray(links?.data) || links?.links?.next) {
    console.log('Capability list is incomplete; no conclusion about iCloud.');
    process.exitCode = 2;
    return;
  }
  const included = Array.isArray(body.included) ? body.included : [];
  const matching = included.filter(item => item.type === 'bundleIdCapabilities' && links.data.some(link => link.id === item.id && link.type === item.type));
  if (matching.length !== links.data.length) {
    console.log('Capability details are incomplete; no conclusion about iCloud.');
    process.exitCode = 2;
    return;
  }
  const icloud = matching.filter(item => item.attributes?.capabilityType === 'ICLOUD');
  console.log(`Game bundle ID found. iCloud capability: ${icloud.length === 1 ? 'enabled' : icloud.length === 0 ? 'not present' : 'ambiguous'}.`);
  if (icloud.length === 1) {
    const settings = icloud[0].attributes?.settings || [];
    for (const setting of settings) {
      if (setting.key !== 'ICLOUD_VERSION') continue;
      for (const option of setting.options || []) {
        if (typeof option.key === 'string' && typeof option.enabled === 'boolean') {
          console.log(`iCloud version option ${option.key}: ${option.enabled ? 'enabled' : 'disabled'}.`);
        }
      }
    }
  }
  console.log('Container binding, signing profile, CloudKit schema, and device synchronization are not verified by this read-only check.');
}

main().catch(() => { console.log('Apple API response could not be interpreted.'); process.exitCode = 2; });

