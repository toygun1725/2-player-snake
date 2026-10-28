'use strict';

// Read-only check: credentials and private keys never leave the runner or appear in logs.
const crypto = require('node:crypto');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

function fail(message) { console.log(message); process.exitCode = 1; }
const targetProfileName = '2 Player Snake App Store V2 2026';
function selectTargetProfile(profiles) {
  const matches = profiles.filter(p => p.attributes?.profileType === 'IOS_APP_STORE' &&
    p.attributes?.profileState === 'ACTIVE' && p.attributes?.name === targetProfileName);
  return matches.length === 1 ? matches[0] : null;
}
function openssl(args, input) {
  const r = spawnSync('openssl', args, { input, maxBuffer: 4 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('openssl failed');
  return r.stdout;
}
async function main() {
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const apiKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY;
  if (!keyId || !issuer || !apiKey) return fail('Apple API credentials unavailable.');
  const secret = process.env.DIST_CERT_SECRET || process.env.FALLBACK_CERT_SECRET;
  let p12;
  if (secret) p12 = Buffer.from(secret, 'base64');
  else {
    try { p12 = fs.readFileSync(process.env.CERT_PATH); }
    catch (_) { return fail('Distribution signing identity unavailable.'); }
  }
  let certificate;
  let privateKey;
  try {
    const base = ['pkcs12', '-passin', 'env:CI_KEYCHAIN_PASSWORD'];
    const read = extra => {
      try { return openssl([...base, ...extra], p12); }
      catch (_) { return openssl([...base, '-legacy', ...extra], p12); }
    };
    certificate = new crypto.X509Certificate(read(['-clcerts', '-nokeys']));
    const keyPem = read(['-nocerts', '-nodes']).toString('utf8');
    const match = keyPem.match(/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----/);
    if (!match) throw new Error('private key missing');
    privateKey = crypto.createPrivateKey(match[0]);
    const keyPublic = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'der' });
    const certPublic = certificate.publicKey.export({ type: 'spki', format: 'der' });
    if (!keyPublic.equals(certPublic)) return fail('Signing certificate and private key do not match.');
  } catch (_) { return fail('Signing identity could not be opened with the configured password.'); }
  console.log('Distribution certificate and matching private key: available.');
  const b64 = v => Buffer.from(JSON.stringify(v)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const input = `${b64({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${b64({ iss: issuer, iat: now, exp: now + 300, aud: 'appstoreconnect-v1' })}`;
  const signature = crypto.sign('sha256', Buffer.from(input), { key: apiKey.replace(/\\n/g, '\n'), dsaEncoding: 'ieee-p1363' });
  const headers = { Authorization: `Bearer ${input}.${signature.toString('base64url')}` };
  const url = new URL('https://api.appstoreconnect.apple.com/v1/bundleIds');
  url.searchParams.set('filter[identifier]', 'com.twoplayersnake.app');
  url.searchParams.set('include', 'profiles');
  url.searchParams.set('limit[profiles]', '50');
  url.searchParams.set('fields[profiles]', 'name,profileType,profileState');
  const response = await fetch(url, { headers, redirect: 'error' });
  if (!response.ok) return fail(`Apple profile lookup failed: HTTP ${response.status}.`);
  const body = await response.json();
  const links = body.data?.length === 1 && body.data[0].relationships?.profiles;
  if (!links || !Array.isArray(links.data) || links.links?.next) return fail('Profile list incomplete.');
  const profiles = (body.included || []).filter(p => p.type === 'profiles' && links.data.some(l => l.id === p.id && l.type === p.type));
  if (profiles.length !== links.data.length) return fail('Profile details incomplete.');
  const targetProfile = selectTargetProfile(profiles);
  if (!targetProfile) return fail('Expected exactly one active App Store profile with the new profile name.');
  const profileUrl = new URL(`https://api.appstoreconnect.apple.com/v1/profiles/${encodeURIComponent(targetProfile.id)}`);
  profileUrl.searchParams.set('fields[profiles]', 'profileContent');
  const detail = await fetch(profileUrl, { headers, redirect: 'error' });
  if (!detail.ok) return fail(`Profile content lookup failed: HTTP ${detail.status}.`);
  const content = (await detail.json()).data?.attributes?.profileContent;
  if (!content) return fail('Profile content unavailable.');
  const plist = openssl(['cms', '-verify', '-inform', 'DER', '-noverify'], Buffer.from(content, 'base64'));
  const py = 'import plistlib,sys,hashlib; p=plistlib.loads(sys.stdin.buffer.read()); print("\\n".join(hashlib.sha256(c).hexdigest() for c in p.get("DeveloperCertificates",[])))';
  const parsed = spawnSync('python3', ['-c', py], { input: plist, maxBuffer: 8192 });
  if (parsed.status !== 0) return fail('Profile certificate information unavailable.');
  const fingerprints = parsed.stdout.toString('utf8').trim().split('\n');
  const fingerprint = crypto.createHash('sha256').update(certificate.raw).digest('hex');
  if (!fingerprints.includes(fingerprint)) return fail('Distribution certificate does not match the active App Store profile.');
  console.log('Active App Store profile contains the distribution certificate: yes.');
  console.log('This check does not sign an app or verify device iCloud synchronization.');
}
if (require.main === module) main().catch(() => fail('Signing readiness could not be determined.'));
module.exports = { selectTargetProfile };
