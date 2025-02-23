using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface ILatestContentService
    {
        Task<IEnumerable<SearchResultDTO>> GetLatestContentAsync();
    }
}
