import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export interface ReportFilters {
    startDate?: Date;
    endDate?: Date;
    serviceId?: string;
    status?: string;
    clientId?: string;
}

export class ReportService {
    /**
     * Main report query generator
     */
    private static async getReportData(userId: string, filters: ReportFilters) {
        return prisma.appointment.findMany({
            where: {
                userId,
                ...(filters.startDate && filters.endDate ? {
                    date: {
                        gte: filters.startDate,
                        lte: filters.endDate
                    }
                } : {}),
                ...(filters.serviceId ? { eventTypeId: filters.serviceId } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.clientId ? { clientId: filters.clientId } : {})
            },
            include: {
                eventType: true,
                client: true,
                cancellation: true
            },
            orderBy: { date: 'asc' }
        });
    }

    /**
     * Export to CSV Blob
     */
    static async exportToCSV(userId: string, filters: ReportFilters) {
        const data = await this.getReportData(userId, filters);

        const headers = ['Data', 'Início', 'Fim', 'Cliente', 'Email', 'Serviço', 'Valor', 'Status', 'Cancelado Por', 'Motivo'];
        const rows = data.map(app => [
            app.date.toLocaleDateString('pt-BR'),
            app.startTime,
            app.endTime,
            app.clientName,
            app.clientEmail,
            app.eventType?.name || 'N/A',
            Number(app.eventType?.price) || 0,
            app.status,
            app.cancellation?.cancelledBy || '',
            app.cancellation?.reasonType || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Export to Excel Buffer
     */
    static async exportToExcel(userId: string, filters: ReportFilters) {
        const data = await this.getReportData(userId, filters);

        const worksheetData = data.map(app => ({
            'Data': app.date.toLocaleDateString('pt-BR'),
            'Início': app.startTime,
            'Fim': app.endTime,
            'Cliente': app.clientName,
            'Email': app.clientEmail,
            'Serviço': app.eventType?.name || 'N/A',
            'Valor (BRL)': Number(app.eventType?.price) || 0,
            'Status': app.status,
            'Cancelado Por': app.cancellation?.cancelledBy || '',
            'Motivo': app.cancellation?.reasonType || '',
            'Observações': app.cancellation?.reasonText || ''
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
