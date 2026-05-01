import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedMission {
  title: string;
  description: string;
  duration: number; // in minutes
  benefit: string;
  guidance: string;
}

export async function generateMissionForGoal(goal: string): Promise<GeneratedMission> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un coach de développement personnel minimaliste et expert en psychologie comportementale. 
L'utilisateur a l'objectif central suivant : "${goal}".

Crée une mission unique, concrète et profondément adaptée à cet objectif spécifique pour aujourd'hui.
La mission doit durer entre 3 et 7 minutes.

En plus de la mission, explique :
1. Le "Pourquoi" (le bénéfice psychologique ou pratique de cet exercice précis).
2. Un conseil d'expert ("Guidance") pour réussir parfaitement l'exercice.

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
            },
            benefit: {
              type: Type.STRING,
              description: "Une phrase expliquant pourquoi cet exercice est crucial pour l'objectif de l'utilisateur."
            },
            guidance: {
              type: Type.STRING,
              description: "Un conseil subtil ou un 'pro-tip' pour approfondir l'expérience."
            }
          },
          required: ["title", "description", "duration", "benefit", "guidance"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erreur lors de la génération de la mission:", error);
    // Fallback mission
    return {
      title: "Clarté Intérieure",
      description: "Prends quelques instants pour visualiser ton objectif comme s'il était déjà accompli, en te concentrant sur les sensations physiques.",
      duration: 5,
      benefit: "La visualisation renforce les connexions neuronales liées à la réussite.",
      guidance: "Assure-toi d'être dans un endroit calme où tu ne seras pas dérangé."
    };
  }
}
