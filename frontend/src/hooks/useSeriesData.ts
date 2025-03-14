import { useState, useEffect } from "react";
import * as api from "../utils/ApiClient";
import { SeriesDTO } from "../types/SeriesDTO";
import { SeasonDTO } from "../types/SeasonDTO";
import {SeasonEpisodes} from "../interfaces/ISeasonEpisodes"



export const useSeriesData = (seriesId: string) => {
  const [item, setItem] = useState<SeriesDTO | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [seasonsWithEpisodes, setSeasonsWithEpisodes] = useState<SeasonEpisodes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!seriesId) return;
    setLoading(true);
    api
      .fetchSeries(seriesId)
      .then((response) => setItem(response.data))
      .catch((err) => {
        console.error("Error loading series data:", err);
        setError("Failed to load series data.");
      })
      .finally(() => setLoading(false));
  }, [seriesId]);

  // Fetch EP1 episodeId
  useEffect(() => {
    if (!seriesId) return;
    api
      .fetchEpisodeId(seriesId)
      .then((response) => setEpisodeId(response.data.episodeId))
      .catch((err) => console.error("Error loading episode id:", err));
  }, [seriesId]);

  // Fetch seasons and episodes
  useEffect(() => {
    if (!seriesId) return;
    api
      .fetchSeasons(seriesId)
      .then(async (seasonResponse) => {
        const seasonsData = seasonResponse.data;
        const promises = seasonsData.map(async (s: SeasonDTO) => {
          const epResponse = await api.fetchEpisodesBySeason(s.id);
          return { season: s, episodes: epResponse.data };
        });
        const results = await Promise.all(promises);
        results.sort((a, b) => a.season.seasonNumber - b.season.seasonNumber);
        setSeasonsWithEpisodes(results);
      })
      .catch((err) => {
        console.error("Error loading seasons or episodes:", err);
        setError("Failed to load seasons or episodes data.");
      });
  }, [seriesId]);

  return { item, setItem, episodeId, seasonsWithEpisodes, setSeasonsWithEpisodes, loading, error };
};
