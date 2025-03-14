using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class PersonWithCharacterDTO
    {
     
        public PersonDTO Person { get; set; }
        public List<CharacterDTO> Characters { get; set; }

        public static PersonWithCharacterDTO CreateFromPersonAndCharacters(Person person, IEnumerable<Character> characters)
        {
            return new PersonWithCharacterDTO
            {
                Person = PersonDTO.CreateFromPerson(person),
                Characters = characters.Select(c => CharacterDTO.CreateFromCharacter(c)).ToList()
            };
        }
    }
}
