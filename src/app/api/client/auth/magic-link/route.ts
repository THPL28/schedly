import { NextResponse } from 'next/server';
import { ClientPortalService } from '@/services/clientPortalService';

export async function POST(req: Request) {
    try {
        const { email, providerSlug } = await req.json();

        if (!email || !providerSlug) {
            return NextResponse.json({ error: 'Email e identificador do prestador são obrigatórios' }, { status: 400 });
        }

        await ClientPortalService.requestMagicLink(email, providerSlug);

        return NextResponse.json({ message: 'Link mágico enviado para seu email' });
    } catch (error: any) {
        console.error('[MAGICLINK_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Erro ao enviar link mágico' }, { status: 500 });
    }
}
