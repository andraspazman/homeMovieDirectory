using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class EpisodeDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Genre { get; set; } 
        public int ReleaseYear { get; set; }     
        public string Description { get; set; }        
        public string Language { get; set; }
        public string Award { get; set; }    
        public string? VideoPath { get; set; }
        public Guid SeasonId { get; set; }

        public static EpisodeDTO CreateFromEpisodeDocument(Episode episode)
        {
            return new EpisodeDTO
            {
                Id = episode.Id,
                Title = episode.Title,
                Genre = episode.Genre,
                ReleaseYear = episode.ReleaseYear,
                Description = episode.Description,
                Language = episode.Language,
                Award = episode.Award,
                VideoPath = episode.VideoPath,
                SeasonId = episode.Season.Id, // Feltételezzük, hogy Season nem null
            };
        }
    }
}
