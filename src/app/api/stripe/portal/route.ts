import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'schedly-super-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(SESSION_SECRET);

async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, key);
        return payload as { userId: string };
    } catch (error) {
        return null;
    }
}

export async function POST() {
    try {
        const sessionPayload = await getAuthUser();
        if (!sessionPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = (await prisma.user.findUnique({
            where: { id: sessionPayload.userId },
        })) as any;

        if (!dbUser || !dbUser.stripeCustomerId) {
            return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
        }

        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (err: any) {
        console.error('Portal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
