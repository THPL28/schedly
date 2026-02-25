import { NextResponse } from 'next/server';
import { ReportService, ReportFilters } from '@/services/reportService';
import { verifySession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId as string;
    const { searchParams } = new URL(req.url);

    const format = searchParams.get('format') || 'csv';
    const filters: ReportFilters = {
        startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
        endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
        status: searchParams.get('status') || undefined,
        serviceId: searchParams.get('serviceId') || undefined,
    };

    try {
        if (format === 'csv') {
            const csv = await ReportService.exportToCSV(userId, filters);
            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="relatorio-${new Date().getTime()}.csv"`
                }
            });
        }

        if (format === 'xlsx') {
            const excel = await ReportService.exportToExcel(userId, filters);
            return new Response(excel, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="relatorio-${new Date().getTime()}.xlsx"`
                }
            });
        }

        return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
    }
}
