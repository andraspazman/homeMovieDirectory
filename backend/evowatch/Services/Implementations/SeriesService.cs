using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;

namespace evoWatch.Services.Implementations
{
    public class SeriesService : ISeriesService
    {
        private readonly ISeriesRepository _seriesRepository;
        private readonly IMovieService _movieService;

        public SeriesService(ISeriesRepository seriesRepository, IMovieService movieService) 
        {
            _seriesRepository = seriesRepository;
            _movieService = movieService;
        }

        public async Task<SeriesDTO> GetSeriesByIdAsync(Guid id)
        {
            var series = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return SeriesDTO.CreateFromSeriesDocument(series);           
        }

        public async Task<SeriesDTO> AddSeriesAsync(SeriesDTO series)
        {
            var newSeries = new Series()
            {
                Id = Guid.NewGuid(),
                Title = series.Title,
                Genre = series.Genre,
                ReleaseYear = series.ReleaseYear,
                FinalYear = series.FinalYear,
                Description = series.Description
            };
            var result = await _seriesRepository.AddSeriesAsync(newSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);    
        }

        public async Task<IEnumerable<SeriesDTO>> GetSeriesAsync()
        {
          var result =  await _seriesRepository.GetSeriesAsync();
          return result.Select(x => SeriesDTO.CreateFromSeriesDocument(x));
        }

        public async Task<SeriesDTO> UpdateSeriesAsync(Guid id, SeriesDTO series)
        {
            var existingSeries = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();

            existingSeries.Title = series.Title;
            existingSeries.Genre = series.Genre;
            existingSeries.ReleaseYear = series.ReleaseYear;
            existingSeries.FinalYear = series.FinalYear;
            existingSeries.Description = series.Description;
            
            var result = await _seriesRepository.UpdateSeriesAsync(existingSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);
        }

        public async Task<bool> DeleteSeriesAsync(Guid id)
        {
            var seriesDelete = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return await _seriesRepository.DeleteSeriesAsync(seriesDelete);
        }

        public async Task<SeriesDTO> AddCompleteSeriesAsync(SeriesDTO seriesDto, SeasonDTO seasonDto, EpisodeDTO episodeDto, IFormFile? videoFile)
        {
            // 1. Létrehozzuk a Series modellt
            var newSeries = new Series
            {
                Id = Guid.NewGuid(),
                Title = seriesDto.Title,
                Genre = seriesDto.Genre,
                ReleaseYear = seriesDto.ReleaseYear,
                FinalYear = seriesDto.FinalYear,
                Description = seriesDto.Description,
                Seasons = new List<Season>()
            };

            // 2. Létrehozzuk a Season modellt
            var newSeason = new Season
            {
                Id = Guid.NewGuid(),
                SeasonNumber = seasonDto.SeasonNumber,
                ReleaseYear = seasonDto.ReleaseYear,
                Series = newSeries,
                Episodes = new List<Episode>()
            };

            // 3. Feltöltjük a videófájlt a MovieService segítségével
            string? videoPath = null;
            if (videoFile != null)
            {
                videoPath = await _movieService.SaveVideoAsync(videoFile);
            }

            // 4. Létrehozzuk az Episode modellt
            var newEpisode = new Episode
            {
                Id = Guid.NewGuid(),
                Title = episodeDto.Title,
                Genre = episodeDto.Genre,
                ReleaseYear = episodeDto.ReleaseYear,
                Description = episodeDto.Description,
                Language = episodeDto.Language,
                Award = episodeDto.Award,
                VideoPath = videoPath, // Itt mentjük az elérési útvonalat
                Season = newSeason
            };

            // 5. Hozzáadjuk a szezonhoz és sorozathoz
            newSeason.Episodes.Add(newEpisode);
            newSeries.Seasons.Add(newSeason);

            // 6. Létrehozzuk a repository híváshoz szükséges adatokat
            List<Season> seasons = new List<Season> { newSeason };
            Dictionary<Guid, List<Episode>> episodesBySeason = new Dictionary<Guid, List<Episode>>
            {
                { newSeason.Id, new List<Episode> { newEpisode } }
        };

            // 7. Mentjük az adatokat az adatbázisba
            Series resultSeries = await _seriesRepository.AddCompleteSeriesAsync(newSeries, seasons, episodesBySeason);

            // 8. Visszaadjuk az eredményt DTO formában
            return SeriesDTO.CreateFromSeriesDocument(resultSeries);
        }
    }
}
