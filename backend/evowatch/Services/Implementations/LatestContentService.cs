using evoWatch.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace evoWatch.Services
{
    
    public class LatestContentService : ILatestContentService
    {
        private readonly IMovieService _movieService;
        private readonly ISeriesService _seriesService;

        public LatestContentService(IMovieService movieService, ISeriesService seriesService)
        {
            _movieService = movieService;
            _seriesService = seriesService;
        }

        public async Task<IEnumerable<SearchResultDTO>> GetLatestContentAsync()
        {
            var movies = await _movieService.GetMoviesAsync();
            var series = await _seriesService.GetSeriesAsync();

            var latestMovies = movies .OrderByDescending(m => m.ReleaseYear).Take(4).Select(m => new SearchResultDTO{
                    Id = m.Id,
                    Title = m.Title,
                    Genre = m.Genre,
                    ReleaseYear = m.ReleaseYear,
                    Type = "movie"
            });

            var latestSeries = series.OrderByDescending(s => s.ReleaseYear).Take(4).Select(s => new SearchResultDTO{
                    Id = s.Id,
                    Title = s.Title,
                    Genre = s.Genre,
                    ReleaseYear = s.ReleaseYear,
                    Type = "series"
            });

            return latestMovies.Concat(latestSeries);
        }
    }
}
