


import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string, price: number): Promise<string> => {
  try {
    // Initializing GoogleGenAI client inside the function to use the environment API key reliably
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for text generation task
    const prompt = `
      Atue como um especialista em marketing de e-commerce.
      Escreva uma descrição de produto curta, persuasiva e atraente (máximo de 300 caracteres) para um produto chamado "${productName}" que custa R$ ${price}.
      Destaque valor e exclusividade. A resposta deve ser apenas o texto da descrição, sem aspas ou preâmbulos.
    `;

    // Calling generateContent directly with model name as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Descrição não disponível.";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "Não foi possível gerar a descrição automaticamente.";
  }
};
