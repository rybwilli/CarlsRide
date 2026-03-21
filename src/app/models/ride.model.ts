export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Rider {
  name: string;
  email?: string;
}

export interface Ride {
  id: string;
  name: string;
  startLocation: string;
  departureTime: string; // ISO string
  distanceMiles: number;
  difficulty: Difficulty;
  leader: string;
  leaderContact?: string;
  notes?: string;
  riders: Rider[];
}
