using evoWatch.Database.Models;
using System.Linq;
using System.Collections.Generic;

namespace evoWatch.DTOs
{
    public class EpisodeDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? VideoPath { get; set; }
        public bool IsMovie { get; set; }
        public Guid SeasonId { get; set; }

        // Kapcsolódó személyek listája (DTO formában)
        public List<PersonDTO> Persons { get; set; } = new List<PersonDTO>();

        public static EpisodeDTO CreateFromEpisodeDocument(Episode episode)
        {
            return new EpisodeDTO
            {
                Id = episode.Id,
                Title = episode.Title,
                VideoPath = episode.VideoPath,
                IsMovie = episode.IsMovie,
                SeasonId = episode.Season != null ? episode.Season.Id : Guid.Empty,
                Persons = episode.Person != null
                            ? episode.Person.Select(p => PersonDTO.CreateFromPerson(p)).ToList()
                            : new List<PersonDTO>()
            };
        }
    }
}
