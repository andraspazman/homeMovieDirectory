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
        // The season number
        public int SeasonNumber { get; set; }
        // The year the season was released
        public int ReleaseYear { get; set; }
        // The number of episodes in the season
        public int EpisodeCount { get; set; }
        // The ID of the series this season belongs to
        public Guid SeriesId { get; set; }

        // Creates a SeasonDTO from a Season entity
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
