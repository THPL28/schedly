import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getDashboardInsight(userName: string, appointments: any[]) {
    if (!process.env.GEMINI_API_KEY) return null;

    const apptsSummary = appointments.map(a => 
        `- ${a.startTime} às ${a.endTime}: ${a.clientName} (${a.eventType?.name || 'Serviço'}) - Notas: ${a.notes || 'Sem notas'}`
    ).join('\n');

    const prompt = `
        Olá Gemini! Você é um assistente de produtividade para o Schedlyfy.
        O profissional ${userName} tem os seguintes agendamentos para hoje:
        ${appointments.length > 0 ? apptsSummary : 'Nenhum agendamento para hoje.'}

        Baseado nisso, dê um insight curto e motivacional (máximo 2 frases) para começar o dia. 
        Se tiver muitos agendamentos, sugira foco. Se tiver poucos, sugira organização ou prospecção.
        Responda diretamente em português.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
}
