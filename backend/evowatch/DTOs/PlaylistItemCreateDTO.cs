namespace evoWatch.DTOs
{
    public class PlaylistItemCreateDTO
    {
        // A lejátszási listához tartozó azonosító
        public Guid PlaylistId { get; set; }

        // Film/epizód esetén: MoviesAndEpisodes tábla rekordjának azonosítója
        public Guid? MoviesAndEpisodesId { get; set; }

        // Sorozat esetén: Series tábla rekordjának azonosítója
        public Guid? SeriesId { get; set; }
    }
}
