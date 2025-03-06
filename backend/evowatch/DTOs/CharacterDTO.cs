using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class CharacterDTO
    {
        public Guid Id { get; set; }
        public string CharacterName { get; set; }
        public string Role { get; set; }
        public string? NickName { get; set; }
        public Guid EpisodeId { get; set; }
        public Guid PersonId { get; set; }

        public static CharacterDTO CreateFromCharacter(Character character)
        {
            return new CharacterDTO
            {
                Id = character.Id,
                CharacterName = character.CharacterName,
                Role = character.Role,
                NickName = character.NickName,
                EpisodeId = character.Episode.Id,
                PersonId = character.Person.Id
            };
        }
    }
}
