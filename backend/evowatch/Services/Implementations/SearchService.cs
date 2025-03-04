using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Database.Repositories;
using evoWatch.Services;

public class SearchService : ISearchService
{
    private readonly IMovieService _movieService;
    private readonly ISeriesService _seriesService;

    public SearchService(IMovieService movieService, ISeriesService seriesService)
    {
        _movieService = movieService;
        _seriesService = seriesService;
    }

    public async Task<IEnumerable<SearchResultDTO>> SearchByTitleAsync(string query)
    {
        var movies = await _movieService.GetMoviesAsync();
        var series = await _seriesService.GetSeriesAsync();

        var movieResults = movies
            .Where(m => m.Title.Contains(query, StringComparison.OrdinalIgnoreCase))
            .Select(m => new SearchResultDTO
            {
                Id = m.Id,
                Title = m.Title,
                Genre = m.Genre,
                ReleaseYear = m.ReleaseYear,
                Type = "Movie"
            });

        var seriesResults = series
            .Where(s => s.Title.Contains(query, StringComparison.OrdinalIgnoreCase))
            .Select(s => new SearchResultDTO
            {
                Id = s.Id,
                Title = s.Title,
                Genre = s.Genre,
                ReleaseYear = s.ReleaseYear,
                Type = "Series"
            });

        // Összevonás
        return movieResults.Concat(seriesResults);
    }
}
