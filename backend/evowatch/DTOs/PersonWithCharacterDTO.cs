using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class PersonWithCharacterDTO
    {
        /// <summary>
        /// Contains the basic information about the person.
        /// </summary>
        public PersonDTO Person { get; set; }

        /// <summary>
        /// Contains the list of characters associated with the person.
        /// </summary>
        public List<CharacterDTO> Characters { get; set; }

        /// <summary>
        /// Creates a PersonWithCharactersDTO from a Person entity and its associated Character entities.
        /// </summary>
        /// <param name="person">The person entity.</param>
        /// <param name="characters">A collection of Character entities linked to the person.</param>
        /// <returns>A populated PersonWithCharactersDTO.</returns>
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
