export type Difficulty = 'easy' | 'moderately easy' | 'moderate' | 'moderately hard' | 'hard';
export type BikeType = 'road' | 'gravel' | 'mountain' | 'city';
export type RouteLinkType = 'strava' | 'gpx' | 'maps';

export interface RouteLink {
  type: RouteLinkType;
  url: string;
}

export interface Rider {
  name: string;
  email?: string;
  additionalGuests?: number;
}

export interface Ride {
  id: string;
  name: string;
  startLocation: string;
  departureTime: string; // ISO string
  distanceMiles: number;
  difficulty: Difficulty;
  bikeType: BikeType;
  description: string;
  leader: string;
  leaderContact?: string;
  notes?: string;
  routeLinks?: RouteLink[];
  riders: Rider[];
}
