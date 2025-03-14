import { SeasonDTO } from "../types/SeasonDTO";
import { EpisodeDTO } from "../types/EpisodeDTO";

export interface SeasonEpisodes {
    season: SeasonDTO;
    episodes: EpisodeDTO[];
}