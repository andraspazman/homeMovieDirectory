using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace evoWatch.Services.Implementations
{
    public class SeriesService : ISeriesService
    {
        private readonly ISeriesRepository _seriesRepository;
        private readonly ISeasonsRepository _seasonsRepository;
        private readonly IEpisodesRepository _episodesRepository;
        private readonly IMovieService _movieService;
        private readonly IWebHostEnvironment _env;
        private readonly IFileSystemService _fileService;

        public SeriesService(  
            ISeriesRepository seriesRepository,
            IMovieService movieService, 
            IWebHostEnvironment env, 
            IFileSystemService fileService, 
            ISeasonsRepository seasonsRepository,
            IEpisodesRepository _episodesRepository
            )

        {
            _seriesRepository = seriesRepository;
            _seasonsRepository = seasonsRepository;
            _movieService = movieService;
            _env = env;
            _fileService = fileService;
        }

        public async Task<SeriesDTO> GetSeriesByIdAsync(Guid id)
        {
            var series = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return SeriesDTO.CreateFromSeriesDocument(series);
        }

        // Új metódus: file feltöltés opcióval
        public async Task<SeriesDTO> AddSeriesAsync(SeriesDTO series, IFormFile? coverImage)
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

            // Kép mentése a külön FileService segítségével
            newSeries.CoverImagePath = await _fileService.SaveFileAsync(coverImage);

            var result = await _seriesRepository.AddSeriesAsync(newSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);
        }


        public async Task<IEnumerable<SeriesDTO>> GetSeriesAsync()
        {
            var result = await _seriesRepository.GetSeriesAsync();
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

            // Ha szükséges, itt is lehetőség van a kép frissítésére

            var result = await _seriesRepository.UpdateSeriesAsync(existingSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);
        }

        public async Task<bool> DeleteSeriesAsync(Guid id)
        {
            var seriesDelete = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return await _seriesRepository.DeleteSeriesAsync(seriesDelete);
        }

        public async Task<CompleteSeriesDTO> AddCompleteSeriesAsync(CompleteSeriesDTO completeSeriesDto, IFormFile? coverImage)
        {
            var newSeries = new Series
            {
                Id = Guid.NewGuid(),
                Title = completeSeriesDto.SeriesDto.Title,
                Genre = completeSeriesDto.SeriesDto.Genre,
                ReleaseYear = completeSeriesDto.SeriesDto.ReleaseYear,
                FinalYear = completeSeriesDto.SeriesDto.FinalYear,
                Description = completeSeriesDto.SeriesDto.Description,     
                CoverImagePath = await _fileService.SaveFileAsync(coverImage),
                Seasons = new List<Season>()
            };

            foreach (var seasonDto in completeSeriesDto.SeasonDtos)
            {
                var newSeason = new Season
                {
                    Id = Guid.NewGuid(),
                    SeasonNumber = seasonDto.SeasonNumber,
                    ReleaseYear = seasonDto.ReleaseYear,   
                    Episodes = new List<Episode>()
                    // A navigációs property "Series" beállítása opcionális
                    // az EF Core automatikusan beállítja a kapcsolatot.
                };

                if (seasonDto.Episodes != null && seasonDto.Episodes.Any())
                {
                    foreach (var episodeDto in seasonDto.Episodes)
                    {
                        var newEpisode = new Episode
                        {
                            Id = Guid.NewGuid(),
                            Title = episodeDto.Title,
                            Genre = episodeDto.Genre,
                            ReleaseYear = episodeDto.ReleaseYear,
                            Description = episodeDto.Description,
                            Language = episodeDto.Language,
                            Award = episodeDto.Award,
                            VideoPath = episodeDto.VideoPath,
                            CoverImagePath = episodeDto.CoverImagePath,
                            IsMovie = episodeDto.IsMovie,
                            // A navigációs property beállítása:
                            Season = newSeason
                        };

                        newSeason.Episodes.Add(newEpisode);
                    }
                }

 
                newSeries.Seasons.Add(newSeason);
            }
          
            var savedSeries = await _seriesRepository.AddSeriesAsync(newSeries);


            // 4. A mentett objektum alapján készítsük el a visszatérő DTO-t
            var result = CompleteSeriesDTO.CreateFromSeriesDocument(savedSeries);
            return result;
        }

    }
}
