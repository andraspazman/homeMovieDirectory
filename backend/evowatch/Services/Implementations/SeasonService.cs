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
            var series = await _seriesRepository.GetSeriesByIdAsync(seriesId)?? throw new SeriesNotFoundException();

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

        // Új metódus: a megadott series ID alapján lekéri a hozzá tartozó season DTO-kat.
        public async Task<IEnumerable<SeasonDTO>> GetSeasonsBySeriesIdAsync(Guid seriesId)
        {
            // Először ellenőrizzük, hogy a series létezik
            var series = await _seriesRepository.GetSeriesByIdAsync(seriesId);
            if (series == null)
                throw new SeriesNotFoundException();

            // Feltételezzük, hogy az ISeasonsRepository rendelkezik egy metódussal, ami a seriesId alapján adja vissza a season entitásokat.
            var seasons = await _seasonsRepository.GetSeasonsBySeriesIdAsync(seriesId);

            // Átalakítjuk a Season entitásokat SeasonDTO-vá
            return seasons.Select(season => SeasonDTO.CreateFromSeasonDocument(season));
        }
    }
}
