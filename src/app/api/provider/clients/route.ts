import { NextResponse } from 'next/server';
import { ClientService } from '@/services/clientService';
import { verifySession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId as string;
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    try {
        const data = await ClientService.listClients(userId, { query, page, pageSize });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
    }
}
