const { spawnSync } = require('node:child_process');

const baselineMigration = '20260215043139_init';

function runPrisma(args, input) {
  const result = spawnSync('npx', ['prisma', ...args], {
    stdio: input === undefined ? 'inherit' : ['pipe', 'inherit', 'pipe'],
    input,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  return result;
}

// Vercel/Supabase can contain an existing schema without Prisma's migration
// history. In that case Prisma raises P3005 before it can deploy newer
// migrations. Baseline the original schema only when it has not already been
// recorded. P3008 means the baseline is already recorded and is safe to ignore.
const resolve = runPrisma(['migrate', 'resolve', '--applied', baselineMigration]);

if (resolve.status !== 0) {
  const stderr = resolve.stderr || '';
  if (!stderr.includes('P3008') && !stderr.includes('already recorded as applied')) {
    process.stderr.write(stderr);
    process.exit(resolve.status || 1);
  }
}

const deploy = runPrisma(['migrate', 'deploy']);
process.exit(deploy.status || 0);
