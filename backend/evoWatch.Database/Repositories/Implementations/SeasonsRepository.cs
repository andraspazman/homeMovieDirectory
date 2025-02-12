using evoWatch.Database.Models;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class SeasonsRepository : ISeasonsRepository
    {
        private readonly DatabaseContext _databaseContext;

        public SeasonsRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<Season> AddSeasonAsync(Season season)
        {
            var result = await _databaseContext.Seasons.AddAsync(season);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<IEnumerable<Season>> GetSeasonsAsync()
        {
            return await Task.FromResult(_databaseContext.Seasons.AsEnumerable());
        }

        public async Task<bool> DeleteSeasonAsync(Season season)
        {
            try
            {
                _databaseContext.Seasons.Remove(season);
                await _databaseContext.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }

        public async Task<Season?> GetSeasonByIdAsync(Guid id)
        {
            return await _databaseContext.Seasons.FindAsync(id);
        }

        public async Task<Season> UpdateSeasonAsync(Season season)
        {
            var result = _databaseContext.Seasons.Update(season);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }
    }
}
