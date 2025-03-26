namespace evoWatch.DTOs
{
    public class PlaylistItemCreateDTO
    {
        // The playlist identifier this item should be added to.
        public Guid PlaylistId { get; set; }

        // The user's identifier (needed for auto-creating a playlist).
        public Guid UserId { get; set; }

        // For movie/episode content: the record identifier from MoviesAndEpisodes table.
        public Guid? MoviesAndEpisodesId { get; set; }

        // For series content: the record identifier from the Series table.
        public Guid? SeriesId { get; set; }
    }
}
