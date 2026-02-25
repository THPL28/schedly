import { NextResponse } from 'next/server';
import { ClientPortalService } from '@/services/clientPortalService';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    try {
        const payload = ClientPortalService.verifyToken(token);

        const cookieStore = await cookies();
        cookieStore.set('client_portal_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 // 15 minutes
        });

        // Redirect to the portal dashboard
        return NextResponse.redirect(new URL(`/portal/${payload.providerSlug}`, req.url));
    } catch (error) {
        return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 401 });
    }
}
