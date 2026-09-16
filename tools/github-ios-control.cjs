// Explicit CI control for this repository only. Credentials are never printed.
const { execFileSync } = require('node:child_process');
(async () => {
  const [mode, id] = process.argv.slice(2);
  if (!['cancel', 'dispatch'].includes(mode) || !/^\d+$/.test(id || '')) throw Error('Usage: cancel RUN_ID | dispatch BUILD_NUMBER');
  const value = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
  });
  const token = value.split(/\r?\n/).find(s => s.startsWith('password='))?.slice(9);
  if (!token) throw Error('Git credential unavailable');
  const route = mode === 'cancel' ? `/actions/runs/${id}/cancel` : '/actions/workflows/ios-testflight.yml/dispatches';
  const response = await fetch('https://api.github.com/repos/toygun1725/2-player-snake' + route, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'Snake-CI-Control' },
    body: mode === 'dispatch' ? JSON.stringify({ ref: 'main', inputs: { build_number: id, version_number: '3.3.5' } }) : undefined
  });
  if (!response.ok) throw Error(`GitHub ${response.status}`);
  console.log(`${mode} accepted: ${id} (${response.status})`);
})().catch(e => { console.error(e.message); process.exitCode = 1; });
