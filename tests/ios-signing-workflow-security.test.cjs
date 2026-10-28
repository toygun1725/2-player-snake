'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const workflow = fs.readFileSync('.github/workflows/ios-testflight.yml', 'utf8');

test('iOS workflow never caches, downloads or publishes its signing identity', () => {
  assert.doesNotMatch(workflow, /actions\/cache@|actions\/download-artifact@/);
  assert.doesNotMatch(workflow, /iOS-Distribution-Certificate-p12|certs\/\*\.p12|certs\/\*\.base64/);
  assert.match(workflow, /secrets\.IOS_SIGNING_P12_V3/);
  assert.doesNotMatch(workflow, /secrets\.DISTRIBUTION_CERTIFICATE|secrets\.APPLE_CERT_P12_BASE64|secrets\.CI_KEYCHAIN_PASSWORD/);
  assert.match(workflow, /if \[ -n "\$CERT_DATA" \]; then[\s\S]*?else[\s\S]*?exit 1[\s\S]*?fi/);
  assert.match(workflow, /CI_KEYCHAIN_PASSWORD:\s*\$\{\{ secrets\.IOS_SIGNING_PASSWORD_V3 \}\}/);
  assert.match(workflow, /if \[ -z "\$CI_KEYCHAIN_PASSWORD" \]; then[\s\S]*?exit 1[\s\S]*?fi/);
});

test('iOS signing readiness check reads only a secret and never retrieves public artifacts', () => {
  const readiness = fs.readFileSync('.github/workflows/ios-signing-readiness-check.yml', 'utf8');
  assert.doesNotMatch(readiness, /actions\/cache@|actions\/download-artifact@|iOS-Distribution-Certificate-p12/);
  assert.match(readiness, /DIST_CERT_SECRET:\s*\$\{\{ secrets\.IOS_SIGNING_P12_V2 \}\}/);
  assert.match(readiness, /CI_KEYCHAIN_PASSWORD:\s*\$\{\{ secrets\.IOS_SIGNING_PASSWORD_V2 \}\}/);
  assert.doesNotMatch(readiness, /secrets\.DISTRIBUTION_CERTIFICATE|secrets\.APPLE_CERT_P12_BASE64|secrets\.CI_KEYCHAIN_PASSWORD/);
});

test('signing readiness selects the new active profile while allowing an older active profile', () => {
  const { selectTargetProfile } = require('../tools/check-ios-signing-readiness.cjs');
  const profile = (id, name, state = 'ACTIVE', type = 'IOS_APP_STORE') => ({
    id, attributes: { name, profileState: state, profileType: type }
  });
  const old = profile('old', 'com.twoplayersnake.app AppStore 1792142844');
  const target = profile('new', '2 Player Snake App Store V2 2026');
  assert.equal(selectTargetProfile([old, target]), target);
  assert.equal(selectTargetProfile([old]), null);
  assert.equal(selectTargetProfile([old, profile('new', target.attributes.name, 'INVALID')]), null);
  assert.equal(selectTargetProfile([target, profile('duplicate', target.attributes.name)]), null);
  assert.equal(selectTargetProfile([profile('wrong-type', target.attributes.name, 'ACTIVE', 'IOS_APP_DEVELOPMENT')]), null);
});

test('release lane requests the new profile without automatically changing it', () => {
  const fastfile = fs.readFileSync('Ana Dosya/iOS/fastlane/Fastfile', 'utf8');
  assert.match(fastfile, /provisioning_name:\s*"2 Player Snake App Store V2 2026"/);
  assert.match(fastfile, /ignore_profiles_with_different_name:\s*true/);
  assert.match(fastfile, /cert_id:\s*"ZPZMAX7K2S"/);
  assert.doesNotMatch(fastfile, /\bforce\s*:/);
  assert.match(fastfile, /ENV\.delete\("SIGH_FORCE"\)/);
  assert.match(fastfile, /get_provisioning_profile\([\s\S]*?readonly:\s*true/);
  assert.doesNotMatch(fastfile, /BundleIdCapability\.create/);
  assert.match(fastfile, /bundle_id\.get_capabilities/);
  assert.doesNotMatch(fastfile, /bundle_id\.get_bundle_id_capabilities/);
  assert.doesNotMatch(fastfile, /\bget_certificates\s*\(/);
  assert.doesNotMatch(fastfile, /security export/);
  assert.doesNotMatch(fastfile, /sh\([^\n]*keychain_password/);
  assert.match(fastfile, /Open3\.capture3\("security", "import"/);
});
