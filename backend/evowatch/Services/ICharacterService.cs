using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface ICharacterService
    {

        Task<EpisodeDTO> CreateAndAddCharacterToEpisodeAsync(Guid episodeId, CharacterDTO characterDto);
        Task<IEnumerable<CharacterDTO>> GetCharactersByEpisodeIdAsync(Guid episodeId);
        Task<IEnumerable<PersonWithCharacterDTO>> GetPersonsWithCharactersByEpisodeIdAsync(Guid episodeId);
    }
}
