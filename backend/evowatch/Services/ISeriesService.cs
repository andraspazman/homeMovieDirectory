﻿using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface ISeriesService
    {
        Task<SeriesDTO> AddSeriesAsync(SeriesDTO series, IFormFile? coverImage);
        Task<IEnumerable<SeriesDTO>> GetSeriesAsync();
        Task<SeriesDTO> GetSeriesByIdAsync(Guid id);
        Task<SeriesDTO> UpdateSeriesAsync(Guid id, SeriesDTO series, IFormFile? coverImage);
        Task<bool> DeleteSeriesAsync(Guid id);
        Task<EpisodeIdDTO> GetEp1EpisodeIdAsync(Guid seriesId);

    }
}
