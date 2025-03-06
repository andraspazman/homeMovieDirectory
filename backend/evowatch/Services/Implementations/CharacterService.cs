using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions; // Feltételezve, hogy léteznek EpisodeNotFoundException és PersonNotFoundException
using System;
using System.Data;
using System.Threading.Tasks;

namespace evoWatch.Services.Implementations
{
    public class CharacterService : ICharacterService
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IEpisodesRepository _episodesRepository;
        private readonly IPeopleRepository _peopleRepository;

        public CharacterService(
            ICharacterRepository characterRepository,
            IEpisodesRepository episodesRepository,
            IPeopleRepository peopleRepository)
        {
            _characterRepository = characterRepository;
            _episodesRepository = episodesRepository;
            _peopleRepository = peopleRepository;
        }

        public async Task<EpisodeDTO> CreateAndAddCharacterToEpisodeAsync(Guid episodeId, CharacterDTO characterDto)
        {
            // Az epizód betöltése a kapcsolódó karakterekkel
            var episode = await _episodesRepository.GetEpisodeByIdWithCharactersAsync(episodeId);
            if (episode == null)
                throw new EpisodeNotFoundException();

            // A megadott személy lekérése a karakterhez
            var person = await _peopleRepository.GetPersonByIdAsync(characterDto.PersonId);
            if (person == null)
                throw new PersonNotFoundException();

            // Új Character entitás létrehozása a DTO alapján
            var character = new Character
            {
                Id = Guid.NewGuid(),
                CharacterName = characterDto.CharacterName,
                Role = characterDto.Role,
                NickName = characterDto.NickName,
                Episode = episode, // Kapcsolódik az epizódhoz
                Person = person    // Kapcsolódik a személyhez
            };

            // Az új karakter mentése az adatbázisban
            var addedCharacter = await _characterRepository.AddCharacterAsync(character);

            // Hozzáadjuk a karaktert az epizód navigációs gyűjteményéhez
            episode.Characters.Add(addedCharacter);

            // Az epizód frissítése (ezzel mentjük a kapcsolatot is)
            var updatedEpisode = await _episodesRepository.UpdateEpisodeAsync(episode);

            return EpisodeDTO.CreateFromEpisodeDocument(updatedEpisode);
        }

        public async Task<IEnumerable<CharacterDTO>> GetCharactersByEpisodeIdAsync(Guid episodeId)
        {
            // Load the episode with characters and their associated persons
            var episode = await _episodesRepository.GetEpisodeByIdWithCharactersAsync(episodeId);
            if (episode == null) throw new EpisodeNotFoundException();

            var characterDtos = episode.Characters.Select(c => new CharacterDTO
            {
                Id = c.Id,
                CharacterName = c.CharacterName,
                Role = c.Role,
                NickName = c.NickName,
                EpisodeId = episode.Id,
                PersonId = c.Person.Id
            });

            return characterDtos;
        }

        public async Task<IEnumerable<PersonWithCharacterDTO>> GetPersonsWithCharactersByEpisodeIdAsync(Guid episodeId)
        {
            // Betöltjük az epizódot a kapcsolódó személyekkel és karakterekkel együtt
            var episode = await _episodesRepository.GetEpisodeWithPersonsAndCharactersAsync(episodeId);
            if (episode == null) throw new EpisodeNotFoundException();

            // Az epizódhoz tartozó összes személyt az epizód.Person navigációs property tartalmazza
            // Minden személyhez hozzárendeljük azokat a karaktereket, amelyek a karakterek között megtalálhatóak,
            // és amelyeknél a c.Person.Id megegyezik az adott személy Id-jával.
            var personsWithCharacters = episode.Person
                .Select(person =>
                {
                    var charactersForPerson = episode.Characters
                        .Where(c => c.Person.Id == person.Id)
                        .ToList();

                    return PersonWithCharacterDTO.CreateFromPersonAndCharacters(person, charactersForPerson);
                })
                .ToList();

            return personsWithCharacters;
        }


    }
}
