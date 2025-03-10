using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface ISeasonService
    {
        Task<SeasonDTO> AddSeasonToSeriesAsync(Guid seriesId, SeasonDTO seasonDto);
        Task<IEnumerable<SeasonDTO>> GetSeasonsBySeriesIdAsync(Guid seriesId);
    }
}
