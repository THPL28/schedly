import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f';
const key = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect Portal Routes
    if (pathname.startsWith('/portal') && !pathname.includes('/auth') && !pathname.includes('/login')) {
        const token = request.cookies.get('client_portal_token')?.value;

        if (!token) {
            // Extract provider slug from path /portal/[slug]/...
            const segments = pathname.split('/');
            const providerSlug = segments[2];
            return NextResponse.redirect(new URL(`/portal/${providerSlug}/login`, request.url));
        }

        try {
            await jwtVerify(token, key);
            return NextResponse.next();
        } catch (e) {
            const segments = pathname.split('/');
            const providerSlug = segments[2];
            return NextResponse.redirect(new URL(`/portal/${providerSlug}/login`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/portal/:path*'],
};
