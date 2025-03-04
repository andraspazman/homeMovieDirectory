using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class PersonDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? Age { get; set; }
        public string? Role { get; set; }
        public string? Awards { get; set; }
        public string? Gender { get; set; }

        // Navigation properties are typically omitted or transformed into identifiers/sub-DTOs.
        // If needed, you can add, for example:
        // public List<Guid> EpisodeIds { get; set; } = new List<Guid>();
        // public List<Guid> CharacterIds { get; set; } = new List<Guid>();

        public static PersonDTO CreateFromPerson(Person person)
        {
            return new PersonDTO
            {
                Id = person.Id,
                Name = person.Name,
                Age = person.Age,
                Role = person.Role,
                Awards = person.Awards,
                Gender = person.Gender,
                // Optionally, map navigation properties if necessary.
                // EpisodeIds = person.Episodes.Select(e => e.Id).ToList(),
                // CharacterIds = person.Characters.Select(c => c.Id).ToList()
            };
        }
    }
}
