using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class EpisodeRepository : IEpisodesRepository
    {
        private readonly DatabaseContext _databaseContext;

        public EpisodeRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<Episode> AddEpisodeAsync(Episode episode)
        {
            var result = await _databaseContext.MoviesAndEpisodes.AddAsync(episode);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<IEnumerable<Episode>> GetEpisodesAsync()
        {
            return await Task.FromResult(_databaseContext.MoviesAndEpisodes.AsEnumerable());
        }

        public async Task<Episode?> GetEpisodeByIdAsync(Guid id)
        {
            return await _databaseContext.MoviesAndEpisodes.FindAsync(id);
        }

        public async Task<Episode> UpdateEpisodeAsync(Episode episode)
        {
            var result = _databaseContext.MoviesAndEpisodes.Update(episode);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeleteEpisodeAsync(Episode episode)
        {
            try
            {
                _databaseContext.MoviesAndEpisodes.Remove(episode);
                await _databaseContext.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }
    }
}
