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

        const body = await req.json().catch(() => ({}));
        const planId = body.planId || body.priceId;

        console.log('--- Checkout Request ---');
        console.log('Received planId/priceId:', planId);

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

        if (planId === 'BASIC' || planId === 'prod_U1ADHKfh6Bxw9h') {
            actualPriceId = process.env.STRIPE_PRICE_BASIC || '';
        } else if (planId === 'PRO' || planId === 'prod_U1AE1hdAt9j5jx') {
            actualPriceId = process.env.STRIPE_PRICE_PRO || '';
        } else {
            actualPriceId = planId;
        }

        console.log('Resolved initial priceId:', actualPriceId);

        // If it's a product ID (starts with prod_), resolve it to its default price
        if (actualPriceId.startsWith('prod_')) {
            console.log('Resolving product ID:', actualPriceId);
            try {
                const product = await stripe.products.retrieve(actualPriceId);
                if (typeof product.default_price === 'string') {
                    actualPriceId = product.default_price;
                } else if (product.default_price) {
                    actualPriceId = (product.default_price as any).id;
                } else {
                    const prices = await stripe.prices.list({ product: actualPriceId, active: true, limit: 1 });
                    if (prices.data.length > 0) {
                        actualPriceId = prices.data[0].id;
                    }
                }
            } catch (e) {
                console.error('Error resolving product ID:', e);
            }
        }

        console.log('Final priceId for Stripe:', actualPriceId);

        if (!actualPriceId) {
            return NextResponse.json({ error: 'Invalid plan selected or Price ID missing.' }, { status: 400 });
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
