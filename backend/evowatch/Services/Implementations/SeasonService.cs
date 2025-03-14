using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // Már meglévő metódus az új season hozzáadásához
        public async Task<SeasonDTO> AddSeasonToSeriesAsync(Guid seriesId, SeasonDTO seasonDto)
        {
            // Optionally verify that the Series exists
            var series = await _seriesRepository.GetSeriesByIdAsync(seriesId) ?? throw new SeriesNotFoundException();

            var newSeason = new Season
            {
                Id = Guid.NewGuid(),
                SeasonNumber = seasonDto.SeasonNumber,
                ReleaseYear = seasonDto.ReleaseYear,
                Series = series,
                Episodes = new List<Episode>()
            };

            var addedSeason = await _seasonsRepository.AddSeasonAsync(newSeason);

            return SeasonDTO.CreateFromSeasonDocument(addedSeason);
        }

       
        public async Task<IEnumerable<SeasonDTO>> GetSeasonsBySeriesIdAsync(Guid seriesId)
        {

            var series = await _seriesRepository.GetSeriesByIdAsync(seriesId);
            if (series == null)throw new SeriesNotFoundException();

            var seasons = await _seasonsRepository.GetSeasonsBySeriesIdAsync(seriesId);

            return seasons.Select(season => SeasonDTO.CreateFromSeasonDocument(season));
        }

        public async Task<SeasonDTO> UpdateSeasonAsync(Guid seasonId, SeasonDTO seasonDto)
        {
            // Lekérjük a módosítandó szezont a repository-ból
            var season = await _seasonsRepository.GetSeasonByIdAsync(seasonId);
            if (season == null) throw new SeasonNotFoundException();

            // Frissítjük a SeasonNumber-t, ha az új érték nem 0 és eltér az aktuális értéktől
            if (seasonDto.SeasonNumber != 0 && seasonDto.SeasonNumber != season.SeasonNumber)
            {
                season.SeasonNumber = seasonDto.SeasonNumber;
            }

            // Frissítjük a ReleaseYear-t, ha az új érték nem 0 és eltér az aktuális értéktől
            if (seasonDto.ReleaseYear != 0 && seasonDto.ReleaseYear != season.ReleaseYear)
            {
                season.ReleaseYear = seasonDto.ReleaseYear;
            }

            var updatedSeason = await _seasonsRepository.UpdateSeasonAsync(season);

            return SeasonDTO.CreateFromSeasonDocument(updatedSeason);
        }

        /// Deletes a season if it does not have any episodes.
        public async Task DeleteSeasonAsync(Guid seasonId)
        {
            var season = await _seasonsRepository.GetSeasonByIdAsync(seasonId);
            if (season == null) throw new SeasonNotFoundException();

            if (season.Episodes != null && season.Episodes.Any()) throw new SeasonNotEmptyException();

            await _seasonsRepository.DeleteSeasonAsync(season);
        }
    }
}
