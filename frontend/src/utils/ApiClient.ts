import axios from "axios";
import { SeriesDTO } from "../types/SeriesDTO";
import { EpisodeIdDTO } from "../types/EpisodeIdDTO";
import { PersonWithCharacterDTO } from "../types/PersonWithCharacterDTO";
import { ProductionCompanyDTO } from "../types/ProductionCompanyDTO";
import { SeasonDTO } from "../types/SeasonDTO";
import { EpisodeDTO } from "../types/EpisodeDTO";

const BASE_URL = "https://localhost:7204";

export const fetchSeries = (seriesId: string) => {
  return axios.get<SeriesDTO>(`${BASE_URL}/series/${seriesId}`);
};

export const fetchEpisodeId = (seriesId: string) => {
  return axios.get<EpisodeIdDTO>(`${BASE_URL}/series/${seriesId}/ep1-id`);
};

export const fetchPersonsWithCharacters = (episodeId: string) => {
  return axios.get<PersonWithCharacterDTO[]>(`${BASE_URL}/character/episode/${episodeId}/persons-with-characters`);
};

export const fetchProductionCompany = (episodeId: string) => {
  return axios.get<ProductionCompanyDTO>(`${BASE_URL}/episode/${episodeId}/productioncompany`);
};

export const fetchSeasons = (seriesId: string) => {
  return axios.get<SeasonDTO[]>(`${BASE_URL}/seasons/byseries/${seriesId}`);
};

export const fetchEpisodesBySeason = (seasonId: string) => {
  return axios.get<EpisodeDTO[]>(`${BASE_URL}/episode/season/${seasonId}`);
};

export const deleteEpisode = (episodeId: string) => {
  return axios.delete(`${BASE_URL}/episode/${episodeId}`);
};

export const deleteSeason = (seasonId: string) => {
  return axios.delete(`${BASE_URL}/seasons/${seasonId}`);
};

export const deletePerson = async (personId: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/person/${personId}`);
};