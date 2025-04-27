using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class MovieDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Genre { get; set; }
        public int? ReleaseYear { get; set; }
        public string Description { get; set; }
        public string Language { get; set; }
        public string? Award { get; set; }
        public string? VideoPath { get; set; }
        public string? CoverImagePath { get; set; }
        public bool IsMovie { get; set; }
        public string? ImdbRating { get; set; }

        public static MovieDTO CreateFromEpisodeDocument(Episode episode)
        {
            return new MovieDTO
            {
                Id = episode.Id,
                Title = episode.Title,
                Genre = episode.Genre,
                ReleaseYear = episode.ReleaseYear,
                Description = episode.Description,
                Language = episode.Language,
                Award = episode.Award,
                VideoPath = episode.VideoPath,
                CoverImagePath = episode.CoverImagePath,
                IsMovie = episode.IsMovie,
                ImdbRating = "N/A"
            };
        }
    }
}
