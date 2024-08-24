import { salesPersonas } from './salesPersonas';

export function selectPersona(): { persona: string, seed: number } {
  const generateSeed = () => {
    const randomFactor = Math.floor(Math.random() * 1000);
    const timeFactor = new Date().getTime() % 1000;
    return (randomFactor + timeFactor) % salesPersonas.length;
  };

  const seed = generateSeed();
  const persona = salesPersonas[seed];

  return { persona, seed };
}