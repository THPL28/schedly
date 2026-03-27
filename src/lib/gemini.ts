import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_GEMINI_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

function isUnsupportedModelError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return (
        message.includes("404 Not Found") ||
        message.includes("is not found") ||
        message.includes("not supported for generateContent")
    );
}

export async function getDashboardInsight(userName: string, appointments: any[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);

    const apptsSummary = appointments
        .map(
            (appointment) =>
                `- ${appointment.startTime} às ${appointment.endTime}: ${appointment.clientName} (${appointment.eventType?.name || "Serviço"}) - Notas: ${appointment.notes || "Sem notas"}`
        )
        .join("\n");

    const prompt = `
        Olá Gemini! Você é um assistente de produtividade para o Schedly.
        O profissional ${userName} tem os seguintes agendamentos para hoje:
        ${appointments.length > 0 ? apptsSummary : "Nenhum agendamento para hoje."}

        Com base nisso, dê um insight curto e motivacional (máximo 2 frases) para começar o dia.
        Se tiver muitos agendamentos, sugira foco. Se tiver poucos, sugira organização ou prospecção.
        Responda diretamente em português.
    `;

    for (const modelName of DEFAULT_GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            if (!isUnsupportedModelError(error)) {
                console.error(`Gemini Error (${modelName}):`, error);
                return null;
            }

            console.warn(`Gemini model unavailable, trying next fallback: ${modelName}`);
        }
    }

    return null;
}
