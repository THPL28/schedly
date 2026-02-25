import { prisma } from './src/lib/prisma';

async function check() {
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    process.exit(0);
}

check();
