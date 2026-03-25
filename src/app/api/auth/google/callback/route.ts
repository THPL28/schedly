import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-auth';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_auth_failed`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
    }

    try {
        const tokens = await getTokensFromCode(code);
        
        // Save tokens to the user
        await prisma.user.update({
            where: { id: session.userId as string },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || undefined, // refresh_token might only be present on first run
                googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                googleCalendarEnabled: true
            }
        });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=google_connected`);
    } catch (error) {
        console.error('Error exchanging Google code for tokens:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_exchange_failed`);
    }
}
