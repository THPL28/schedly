import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analyticsService';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId as string;

    try {
        const [metrics, cancellations, topClients] = await Promise.all([
            AnalyticsService.getProviderMetrics(userId),
            AnalyticsService.getCancellationAnalytics(userId),
            AnalyticsService.getTopClients(userId)
        ]);

        return NextResponse.json({
            metrics,
            cancellations,
            topClients
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao processar métricas' }, { status: 500 });
    }
}
