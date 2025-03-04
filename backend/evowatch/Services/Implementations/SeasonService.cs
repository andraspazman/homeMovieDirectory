using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;

namespace evoWatch.Services.Implementations
{
    public class SeasonService : ISeasonService
    {
        private readonly ISeriesRepository _seriesRepository;
        private readonly ISeasonsRepository _seasonsRepository;

        public SeasonService(ISeriesRepository seriesRepository, ISeasonsRepository seasonsRepository)
        {
            _seriesRepository = seriesRepository;
            _seasonsRepository = seasonsRepository;
        }

        public async Task<SeasonDTO> AddSeasonToSeriesAsync(Guid seriesId, SeasonDTO seasonDto)
        {
            // Optionally verify that the Series exists
            var series = await _seriesRepository.GetSeriesByIdAsync(seriesId) ?? throw new SeriesNotFoundException();

            var newSeason = new Season
            {
                Id = Guid.NewGuid(),
                SeasonNumber = seasonDto.SeasonNumber,
                ReleaseYear = seasonDto.ReleaseYear,
                // Set the foreign key manually
                Series = series,
                Episodes = new List<Episode>()
            };

            var addedSeason = await _seasonsRepository.AddSeasonAsync(newSeason);

            return SeasonDTO.CreateFromSeasonDocument(addedSeason);
        }


    }
}
