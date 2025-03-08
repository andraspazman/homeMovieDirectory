import { PersonDTO } from "./PersonDTO";

export interface EpisodeDTO {
  id: string;
  title: string;
  videoPath?: string;
  isMovie: boolean;
  seasonId: string;
  persons: PersonDTO[];
}
