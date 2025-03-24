namespace evoWatch.DTOs
{
    public class SearchResultDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Genre { get; set; }
        public int? ReleaseYear { get; set; }
        public string Type { get; set; }
        public string CoverImagePath { get; set; }
        public bool IsMovie { get; set; }
    }
}
