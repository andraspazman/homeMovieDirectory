using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class SeasonDTO
    {
        public Guid Id { get; set; }
        public int SeasonNumber { get; set; }
        public int ReleaseYear { get; set; }
        public int EpisodeCount { get; set; }
        public Guid SeriesId { get; set; }
        public List<EpisodeDTO> Episodes { get; set; } = new List<EpisodeDTO>();
        public static SeasonDTO CreateFromSeasonDocument(Season season)
        {
            return new SeasonDTO
            {
                Id = season.Id,
                SeasonNumber = season.SeasonNumber,
                ReleaseYear = season.ReleaseYear,
                EpisodeCount = season.EpisodeCount,
                SeriesId = season.Series != null ? season.Series.Id : Guid.Empty,
                Episodes = season.Episodes != null
                    ? season.Episodes.Select(e => EpisodeDTO.CreateFromEpisodeDocument(e)).ToList()
                    : new List<EpisodeDTO>()
            };
        }
    }
}
