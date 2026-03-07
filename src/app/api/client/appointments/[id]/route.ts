import { NextResponse } from 'next/server';
import { ClientPortalService } from '@/services/clientPortalService';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { reasonType, reasonText } = await req.json();

        if (!reasonType) {
            return NextResponse.json({ error: 'Motivo do cancelamento é obrigatório' }, { status: 400 });
        }

        const { id: appointmentId } = await params;

        // we would verify ownership via the token
        const cookieStore = await cookies();
        // in implementation, we would also check if the token is valid and not expired
        const token = cookieStore.get('client_portal_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const payload = ClientPortalService.verifyToken(token);
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { id: true, userId: true, clientEmail: true, status: true }
        });

        // Check if appointment exists and belongs to the user
        if (!appointment) {
            return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
        }
        //This should also include verifying that the token email matches the scheduling email to prevent misuse of the token.
        if (appointment.userId !== payload.providerId || appointment.clientEmail !== payload.email) {
            return NextResponse.json({ error: 'Acesso negado para este agendamento' }, { status: 403 });
        }
        if (appointment.status !== 'SCHEDULED') {
            return NextResponse.json({ error: 'Só é possível cancelar agendamentos ativos' }, { status: 400 });
        }
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
