import { NextResponse } from 'next/server';
import { ClientPortalService } from '@/services/clientPortalService';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('client_portal_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { email, providerId } = ClientPortalService.verifyToken(token);

        const appointments = await ClientPortalService.getClientAppointments(email, providerId);

        return NextResponse.json(appointments);
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
    }
}
