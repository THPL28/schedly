import { NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60');
    const buffer = parseInt(searchParams.get('buffer') || '0');

    if (!dateStr) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    try {
        const slots = await getAvailableSlots(userId, new Date(dateStr), duration, buffer);
        return NextResponse.json({ slots });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }
}
