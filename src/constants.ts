
export interface Mission {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Gratitude Silencieuse",
    description: "Assieds-toi confortablement. Ferme les yeux et identifie trois petites choses pour lesquelles tu es reconnaissant aujourd'hui. Visualise-les intensément."
  },
  {
    id: 2,
    title: "Mouvement Fluide",
    description: "Effectue 7 minutes d'étirements doux. Concentre-toi sur tes épaules, ton cou et ton dos. Respire profondément à chaque mouvement."
  },
  {
    id: 3,
    title: "Écriture Libératrice",
    description: "Prends une feuille ou un carnet. Écris sans t'arrêter tout ce qui te passe par la tête, sans juger la qualité ou la grammaire. Vide ton esprit."
  },
  {
    id: 4,
    title: "Espace Clair",
    description: "Choisis un petit tiroir, une surface de bureau ou un coin d'étagère. Range-le méticuleusement. Un espace clair favorise un esprit clair."
  },
  {
    id: 5,
    title: "Respiration Carrée",
    description: "Inspire sur 4 temps, bloque sur 4, expire sur 4, bloque sur 4. Répète ce cycle pour calmer ton système nerveux."
  },
  {
    id: 6,
    title: "Vision Future",
    description: "Ferme les yeux et imagine-toi dans 6 mois après avoir accompli ton objectif principal. Ressens la fierté et la sérénité de ce moment."
  },
  {
    id: 7,
    title: "Écoute Active",
    description: "Choisis un morceau de musique instrumentale. Écoute-le en essayant de distinguer chaque instrument séparément. Ne fais rien d'autre."
  },
  {
    id: 8,
    title: "Priorités de Demain",
    description: "Identifie les 3 tâches essentielles que tu veux accomplir demain. Pas plus, juste les 3 plus importantes."
  },
  {
    id: 9,
    title: "Marche de Présence",
    description: "Marche lentement dans ton espace. À chaque pas, ressens le contact de ton pied avec le sol et le transfert de ton poids."
  },
  {
    id: 10,
    title: "Lettre de Bienveillance",
    description: "Écris un court paragraphe de remerciement à toi-même pour tous les efforts que tu as fournis récemment. Sois ton meilleur ami."
  }
];

export function getDailyMission(): Mission {
  const today = new Date();
  const index = (today.getFullYear() + today.getMonth() + today.getDate()) % MISSIONS.length;
  return MISSIONS[index];
}
