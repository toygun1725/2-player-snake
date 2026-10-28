'use strict';

// Static checks only: this script does not execute Fastlane or sign an app.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const fastfile = fs.readFileSync('Ana Dosya/iOS/fastlane/Fastfile', 'utf8');
const match = fastfile.match(/get_provisioning_profile\(\s*([\s\S]*?)\n\s*\)/);
assert.ok(match, 'App Store profile selection is missing');
const profile = match[1];
assert.match(profile, /provisioning_name:\s*"2 Player Snake App Store V2 2026"/);
assert.match(profile, /ignore_profiles_with_different_name:\s*true/);
assert.match(profile, /cert_id:\s*"ZPZMAX7K2S"/);
assert.doesNotMatch(profile, /\bforce\s*:/);
assert.match(fastfile, /ENV\.delete\("SIGH_FORCE"\)/);
assert.match(profile, /readonly:\s*true/);
assert.doesNotMatch(fastfile, /BundleIdCapability\.create/);
assert.doesNotMatch(fastfile, /\bget_certificates\s*\(/);
assert.doesNotMatch(fastfile, /security export/);
console.log('Fastlane profile configuration passes the static safety checks.');
