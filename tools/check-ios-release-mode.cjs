'use strict';

function mode(env) {
  const internal = env.SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT || '';
  const release = env.SNAKE_ENABLE_RELEASE_CLOUDKIT || '';
  if (![internal, release].every(value => ['', 'true', 'false'].includes(value))) {
    throw new Error('Unknown build mode value.');
  }
  if ((internal === 'true') === (release === 'true')) {
    throw new Error('Select exactly one iCloud-enabled internal test or release candidate.');
  }
  return internal === 'true' ? 'internal' : 'release';
}

if (require.main === module) {
  try { console.log(`Selected iOS build mode: ${mode(process.env)}`); }
  catch (error) { console.error(`Build blocked: ${error.message}`); process.exitCode = 1; }
}
module.exports = { mode };
