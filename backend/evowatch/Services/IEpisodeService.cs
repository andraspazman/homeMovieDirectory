using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface IEpisodeService
    {
        Task<EpisodeDTO> GetEpisodeByIdAsync(Guid id);
        Task<IEnumerable<EpisodeDTO>> GetEpisodesAsync(Guid seasonId);
        Task<EpisodeDTO> AddEpisodeAsync(EpisodeDTO episodeDto, IFormFile? videoFile);
        Task<EpisodeDTO> UpdateEpisodeAsync(Guid id, EpisodeDTO episodeDto, IFormFile? newVideoFile);
        Task<bool> DeleteEpisodeAsync(Guid id);
        Task<EpisodeDTO> CreateAndAddPersonToEpisodeAsync(Guid episodeId, PersonDTO personDto);
        Task<IEnumerable<PersonDTO>> GetPersonsByEpisodeIdAsync(Guid episodeId);
        Task<EpisodeDTO> AddProductionCompanyToEpisodeAsync(Guid episodeId, ProductionCompanyDTO productionCompanyDto);
        Task<ProductionCompanyDTO> GetProductionCompanyByEpisodeIdAsync(Guid episodeId);
    }
}
