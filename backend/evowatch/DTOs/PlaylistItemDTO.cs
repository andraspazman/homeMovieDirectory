using evoWatch.Database.Models;
using System;

namespace evoWatch.DTOs
{
    public class PlaylistItemDTO
    {
        public Guid Id { get; set; }
        public Guid PlaylistId { get; set; }

        // Film/epizód esetén: MoviesAndEpisodes táblából származó azonosító
        public Guid? MoviesAndEpisodesId { get; set; }

        // Sorozat esetén: Series tábla rekordjának azonosítója
        public Guid? SeriesId { get; set; }

        // Amennyiben az adott MoviesAndEpisodes rekord rendelkezik IsMovie flag-gel,
        // innen eldönthető, hogy filmről vagy epizódról van-e szó.
        public bool? IsMovie { get; set; }

        public static PlaylistItemDTO CreateFromPlaylistItem(PlaylistItem item)
        {
            return new PlaylistItemDTO
            {
                Id = item.Id,
                PlaylistId = item.PlaylistId,
                MoviesAndEpisodesId = item.MoviesAndEpisodesId,
                SeriesId = item.SeriesId,
                // Ha MoviesAndEpisodes entitás ki van töltve, onnan kinyerjük az IsMovie értéket,
                // különben null, mert sorozat esetén ezt nem használjuk.
                IsMovie = item.Episodes != null ? item.Episodes.IsMovie : null
            };
        }
    }
}
