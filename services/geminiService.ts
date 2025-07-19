
import { GoogleGenAI } from "@google/genai";
import { FinancialData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fetchWithGemini = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error fetching data for prompt "${prompt}":`, error);
        throw new Error(`Gemini API request failed. Check console for details.`);
    }
};


export const fetchFinancialData = async (): Promise<FinancialData> => {
    const ufPrompt = "Cual es el valor de la UF en pesos chilenos para el dia de hoy? Responde únicamente con el número, usando punto como separador decimal, sin comas ni símbolos de moneda. Por ejemplo: 37500.50";
    const tmcPrompt = "Cual es la Tasa Máxima Convencional (TMC) anual vigente en Chile para créditos de consumo en pesos, para operaciones en cuotas de más de 90 dias y hasta 200 UF? Responde únicamente con el número del porcentaje, sin el símbolo %. Por ejemplo: 35.5";

    const [ufResponse, tmcResponse] = await Promise.all([
        fetchWithGemini(ufPrompt),
        fetchWithGemini(tmcPrompt),
    ]);
    
    const ufValue = parseFloat(ufResponse.replace(/,/g, ''));
    const tmcRate = parseFloat(tmcResponse.replace(/,/g, '.'));

    if (isNaN(ufValue) || isNaN(tmcRate)) {
        console.error('Failed to parse financial data', { ufResponse, tmcResponse });
        throw new Error("La respuesta de la API no pudo ser interpretada como un número válido.");
    }

    return { ufValue, tmcRate };
};
