import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const DEV_SECRET = 'schedly-development-only-portal-secret';

function getPortalKey() {
    const secret = process.env.JWT_SECRET;

    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be configured in production');
    }

    return new TextEncoder().encode(secret || DEV_SECRET);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/portal') && !pathname.includes('/auth') && !pathname.includes('/login')) {
        const token = request.cookies.get('client_portal_token')?.value;
        const providerSlug = pathname.split('/')[2];

        if (!providerSlug) {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL(`/portal/${providerSlug}/login`, request.url));
        }

        try {
            await jwtVerify(token, getPortalKey(), { algorithms: ['HS256'] });
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL(`/portal/${providerSlug}/login`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/portal/:path*'],
};
