import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { id: string; email: string };
    } catch (error) {
        return null;
    }
}

export async function POST() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = (await prisma.user.findUnique({
            where: { id: user.id },
        })) as any;

        if (!dbUser || !dbUser.stripeCustomerId) {
            return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Portal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
