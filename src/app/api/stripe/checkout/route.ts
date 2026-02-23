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

        const { priceId } = await req.json();
        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        const dbUser = (await prisma.user.findUnique({
            where: { id: sessionPayload.userId },
            include: { subscription: true }
        })) as any;

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let actualPriceId = priceId;

        // If it's a product ID instead of a price ID, fetch the default price
        if (priceId.startsWith('prod_')) {
            const product = await stripe.products.retrieve(priceId);
            if (typeof product.default_price === 'string') {
                actualPriceId = product.default_price;
            } else if (product.default_price) {
                actualPriceId = (product.default_price as any).id;
            } else {
                // If no default price, look for the first active price
                const prices = await stripe.prices.list({ product: priceId, active: true, limit: 1 });
                if (prices.data.length > 0) {
                    actualPriceId = prices.data[0].id;
                } else {
                    return NextResponse.json({ error: 'This product has no active prices.' }, { status: 400 });
                }
            }
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
