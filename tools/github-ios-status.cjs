// Read-only CI status using the existing Git credential helper. Never prints credentials.
const { execFileSync } = require('node:child_process');
(async () => {
  const credential = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
  });
  const token = credential.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
  if (!token) throw new Error('Git credential unavailable');
  const mode = process.argv[2] || 'runs';
  const id = process.argv[3];
  if (['jobs', 'log'].includes(mode) && !/^\d+$/.test(id || '')) throw new Error('Numeric run/job ID required');
  const route = mode === 'jobs' ? `/actions/runs/${id}/jobs` : mode === 'log' ? `/actions/jobs/${id}/logs`
    : mode === 'secrets' ? '/actions/secrets' : '/actions/runs?per_page=8';
  const response = await fetch('https://api.github.com/repos/toygun1725/2-player-snake' + route, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Snake-CI-Status' }
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  if (mode === 'log') {
    const log = await response.text();
    console.log(log.split(/\r?\n/).filter(line => /error:|error |failed|successfully|WEBKIT|Uploading|uploaded|TestFlight|executed|PASS/i.test(line)).join('\n').slice(-16000));
    return;
  }
  const data = await response.json();
  if (mode === 'jobs') console.log(JSON.stringify(data.jobs.map(j => ({ id: j.id, name: j.name, status: j.status, conclusion: j.conclusion, steps: j.steps.map(s => ({ name: s.name, status: s.status, conclusion: s.conclusion })) })), null, 2));
  else if (mode === 'secrets') console.log(JSON.stringify(data.secrets.map(s => s.name)));
  else console.log(JSON.stringify(data.workflow_runs.map(r => ({ id: r.id, number: r.run_number, name: r.name, sha: r.head_sha, status: r.status, conclusion: r.conclusion, url: r.html_url })), null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
