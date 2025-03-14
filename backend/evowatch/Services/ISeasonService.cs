using evoWatch.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace evoWatch.Services
{
    public interface ISeasonService
    {
        Task<SeasonDTO> AddSeasonToSeriesAsync(Guid seriesId, SeasonDTO seasonDto);
        Task<IEnumerable<SeasonDTO>> GetSeasonsBySeriesIdAsync(Guid seriesId);
        Task<SeasonDTO> UpdateSeasonAsync(Guid seasonId, SeasonDTO seasonDto);
        Task DeleteSeasonAsync(Guid seasonId);

    }
}
