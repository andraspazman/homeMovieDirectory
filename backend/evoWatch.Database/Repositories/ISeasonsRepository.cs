using evoWatch.Database.Models;

namespace evoWatch.Database.Repositories
{
    public interface ISeasonsRepository
    {
        Task<Season> AddSeasonAsync(Season season);
        Task<IEnumerable<Season>> GetSeasonsAsync();
        Task<Season?> GetSeasonByIdAsync(Guid id);
        Task<Season> UpdateSeasonAsync(Season season);
        Task<bool> DeleteSeasonAsync(Season season);
    }
}
