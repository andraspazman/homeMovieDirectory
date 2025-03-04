using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface ISearchService
    {
        Task<IEnumerable<SearchResultDTO>> SearchByTitleAsync(string query);
    }
}
