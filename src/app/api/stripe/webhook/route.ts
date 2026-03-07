import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig || !endpointSecret) {
        return NextResponse.json({ error: 'Missing signature or endpoint secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;
            const userId = session.metadata?.userId;

            if (!userId) {
                console.error('No userId in session metadata');
                break;
            }

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const planName = (subscription as any).plan?.nickname || 'Premium';

            await (prisma.subscription as any).upsert({
                where: { userId },
                update: {
                    stripeSubscriptionId: subscriptionId,
                    stripePriceId: subscription.items.data[0].price.id,
                    status: subscription.status.toUpperCase(),
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                },
                create: {
                    userId,
                    stripeSubscriptionId: subscriptionId,
                    stripePriceId: subscription.items.data[0].price.id,
                    status: subscription.status.toUpperCase(),
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                },
            });

            await (prisma.user as any).update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });

            // Fetch user for email
            const dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (dbUser) {
                const { sendSubscriptionSuccessEmail } = await import('@/lib/email-resend');
                await sendSubscriptionSuccessEmail(dbUser.email, dbUser.name || 'Usuário', planName);
            }

            break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            const dbSubscription = await (prisma.subscription as any).findFirst({
                where: { stripeSubscriptionId: subscription.id },
            });

            if (dbSubscription) {
                await (prisma.subscription as any).update({
                    where: { id: dbSubscription.id },
                    data: {
                        status: subscription.status.toUpperCase(),
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        stripePriceId: subscription.items.data[0].price.id,
                    },
                });
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
