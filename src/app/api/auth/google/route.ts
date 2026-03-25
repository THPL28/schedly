import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await verifySession();
    if (!session) {
        console.warn('Attempt to access google auth without session');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    try {
        const url = getAuthUrl();
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Error getting Google Auth URL:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_failed`);
    }
}
