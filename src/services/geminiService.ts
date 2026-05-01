import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedMission {
  title: string;
  description: string;
  duration: number; // in minutes
}

export async function generateMissionForGoal(goal: string): Promise<GeneratedMission> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un coach de développement personnel minimaliste et créatif. 
L'utilisateur a l'objectif suivant : "${goal}".
Crée une mission unique, concrète et profondément adaptée à cet objectif spécifique pour aujourd'hui.
La mission doit durer entre 3 et 7 minutes selon la complexité de l'exercice.

Évite les clichés. Propose quelque chose de pratique, sensoriel ou introspectif qui sort de l'ordinaire.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Un titre court, poétique et spécifique en 3-5 mots"
            },
            description: {
              type: Type.STRING,
              description: "Une instruction claire, étape par étape, sur ce qu'il faut faire."
            },
            duration: {
              type: Type.NUMBER,
              description: "La durée de l'exercice en minutes (nombre entier entre 3 et 7)"
            }
          },
          required: ["title", "description", "duration"]
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
      description: "Prends ces quelques minutes pour réfléchir à l'importance de ton objectif et à la première petite action que tu peux entreprendre maintenant.",
      duration: 5
    };
  }
}
