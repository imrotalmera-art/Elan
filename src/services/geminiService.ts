import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedMission {
  title: string;
  description: string;
}

export async function generateMissionForGoal(goal: string): Promise<GeneratedMission> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un coach de développement personnel minimaliste. 
L'utilisateur a l'objectif suivant : "${goal}".
Crée une mission unique qui dure exactement 7 minutes pour l'aider à progresser vers cet objectif aujourd'hui.
La mission doit être simple, concrète et apaisante.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Un titre court et inspirant en 3-5 mots"
            },
            description: {
              type: Type.STRING,
              description: "Une instruction claire de 2-3 phrases sur ce qu'il faut faire pendant ces 7 minutes."
            }
          },
          required: ["title", "description"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erreur lors de la génération de la mission:", error);
    // Fallback mission
    return {
      title: "Moment d'Introspection",
      description: "Prends ces 7 minutes pour réfléchir à l'importance de ton objectif et à la première petite action que tu peux entreprendre maintenant."
    };
  }
}
