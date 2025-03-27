namespace evoWatch.DTOs
{
    public class PlaylistItemCreateDTO
    {
        public Guid PlaylistId { get; set; }
        public Guid UserId { get; set; }
        public Guid? MoviesAndEpisodesId { get; set; }
        public Guid? SeriesId { get; set; }
    }
}
