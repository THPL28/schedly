import { NextResponse } from 'next/server';
import { ClientPortalService } from '@/services/clientPortalService';
import { cookies } from 'next/headers';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { reasonType, reasonText } = await req.json();

        if (!reasonType) {
            return NextResponse.json({ error: 'Motivo do cancelamento é obrigatório' }, { status: 400 });
        }

        const { id: appointmentId } = params;

        // In a real SaaS, we would verify ownership via the token
        const cookieStore = await cookies();
        const token = cookieStore.get('client_portal_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const payload = ClientPortalService.verifyToken(token);

        // Cancel the appointment
        await ClientPortalService.cancelAppointment({
            appointmentId,
            cancelledBy: 'CLIENT',
            reasonType,
            reasonText
        });

        return NextResponse.json({ message: 'Agendamento cancelado com sucesso' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erro ao cancelar' }, { status: 500 });
    }
}
