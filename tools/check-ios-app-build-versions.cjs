'use strict';

// Read-only App Store Connect check. Never log credentials, tokens or response bodies.
const crypto = require('node:crypto');

async function main() {
  const { APP_STORE_CONNECT_KEY_ID: keyId, APP_STORE_CONNECT_ISSUER_ID: issuer,
    APP_STORE_CONNECT_PRIVATE_KEY: privateKey } = process.env;
  if (!keyId || !issuer || !privateKey) throw new Error('Apple API credentials unavailable');
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const input = `${b64({alg:'ES256',kid:keyId,typ:'JWT'})}.${b64({iss:issuer,iat:now,exp:now+300,aud:'appstoreconnect-v1'})}`;
  const signature = crypto.sign('sha256', Buffer.from(input), {key:privateKey.replace(/\\n/g,'\n'),dsaEncoding:'ieee-p1363'});
  const token = `${input}.${signature.toString('base64url')}`;
  async function read(url) {
    const response = await fetch(url, {headers:{Authorization:`Bearer ${token}`},redirect:'error'});
    if (!response.ok) throw new Error(`Apple API read failed (HTTP ${response.status})`);
    return response.json();
  }
  const apps = new URL('https://api.appstoreconnect.apple.com/v1/apps');
  apps.searchParams.set('filter[bundleId]', 'com.twoplayersnake.app');
  apps.searchParams.set('limit', '2');
  const result = await read(apps);
  if (!Array.isArray(result.data) || result.data.length !== 1 || !result.data[0].id) throw new Error('Game app was not uniquely identified');
  const uploads = new URL(`https://api.appstoreconnect.apple.com/v1/apps/${encodeURIComponent(result.data[0].id)}/buildUploads`);
  uploads.searchParams.set('filter[platform]', 'IOS');
  uploads.searchParams.set('sort', '-uploadedDate');
  uploads.searchParams.set('limit', '200');
  uploads.searchParams.set('fields[buildUploads]', 'cfBundleShortVersionString,cfBundleVersion,uploadedDate,state,platform');
  const response = await read(uploads);
  if (!Array.isArray(response.data)) throw new Error('Build upload list unavailable');
  const entries = response.data.map(item => item.attributes || {});
  const safe = value => typeof value === 'string' && /^[0-9A-Za-z._-]+$/.test(value) ? value : 'unknown';
  const latest = entries[0];
  console.log(`iOS uploaded builds returned: ${entries.length}${response.links?.next ? ' (additional pages exist)' : ''}.`);
  if (latest) console.log(`Most recent upload: version ${safe(latest.cfBundleShortVersionString)}, build ${safe(latest.cfBundleVersion)}, state ${safe(latest.state)}.`);
  const target = entries.filter(item => item.cfBundleShortVersionString === '3.6.5');
  console.log(`Uploads for version 3.6.5 in returned page: ${target.length}.`);
  for (const item of target) console.log(`Version 3.6.5 build ${safe(item.cfBundleVersion)}, state ${safe(item.state)}.`);
  console.log('This is an upload listing only; it does not build, sign, publish, or verify device behavior.');
}
main().catch(() => { console.log('Read-only version check failed; no credentials or response details are displayed.'); process.exitCode = 2; });
