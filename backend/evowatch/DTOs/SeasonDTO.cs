using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace evoWatch.DTOs
{
    public class SeasonDTO
    {
        // Unique identifier for the season
        public Guid Id { get; set; }
        public int SeasonNumber { get; set; }
        public int ReleaseYear { get; set; }
        public int EpisodeCount { get; set; }
        public Guid SeriesId { get; set; }

        public static SeasonDTO CreateFromSeasonDocument(Season season)
        {
            return new SeasonDTO
            {
                Id = season.Id,
                SeasonNumber = season.SeasonNumber,
                ReleaseYear = season.ReleaseYear,
                EpisodeCount = season.EpisodeCount,
                SeriesId = season.Series != null ? season.Series.Id : Guid.Empty
            };
        }
    }
}
