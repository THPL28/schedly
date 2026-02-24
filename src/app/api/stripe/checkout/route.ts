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

export async function POST(req: Request) {
    try {
        const sessionPayload = await getAuthUser();
        if (!sessionPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();
        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        const dbUser = (await prisma.user.findUnique({
            where: { id: sessionPayload.userId },
            include: { subscription: true }
        })) as any;

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let actualPriceId = '';

        if (planId === 'BASIC') {
            actualPriceId = process.env.STRIPE_PRICE_BASIC || '';
        } else if (planId === 'PRO') {
            actualPriceId = process.env.STRIPE_PRICE_PRO || '';
        } else {
            // Fallback for direct IDs if needed
            actualPriceId = planId;
        }

        if (!actualPriceId) {
            return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
        }

        const stripeSession = await stripe.checkout.sessions.create({
            customer: dbUser.stripeCustomerId || undefined,
            customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
            line_items: [
                {
                    price: actualPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/calendar?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
            metadata: {
                userId: sessionPayload.userId,
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (err: any) {
        console.error('Checkout error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
