using evoWatch.Database.Models;
using Microsoft.EntityFrameworkCore;
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
            return await Task.FromResult(_databaseContext.MoviesAndEpisodes.Include(e => e.Season).AsEnumerable()); //modifyed 
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

        public async Task<Episode?> GetEpisodeByIdWithPersonsAsync(Guid id)
        {
            return await _databaseContext.MoviesAndEpisodes.Include(e => e.Person).FirstOrDefaultAsync(e => e.Id == id); //MOD
        }

        public async Task<Episode> GetEpisodeByIdWithCharactersAsync(Guid id)
        {
            return await _databaseContext.MoviesAndEpisodes.Include(e => e.Characters).ThenInclude(c => c.Person).FirstOrDefaultAsync(e => e.Id == id);
        } // MOD: Ha szükséges, töltsük be a karakterekhez tartozó Person entitást is:

        public async Task<Episode> GetEpisodeWithPersonsAndCharactersAsync(Guid id)
        {
            return await _databaseContext.MoviesAndEpisodes
                .Include(e => e.Person)               // Betölti az epizódhoz tartozó személyeket
                .Include(e => e.Characters)           // Betölti az epizódhoz tartozó karaktereket
                    .ThenInclude(c => c.Person)       // Betölti a karakterekhez tartozó személyeket
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Episode>> GetEpisodesByProductionCompanyIdAsync(Guid productionCompanyId)
        {
            return await _databaseContext.MoviesAndEpisodes
                .Include(e => e.ProductionCompany)
                .Where(e => e.ProductionCompany != null && e.ProductionCompany.Id == productionCompanyId)
                .ToListAsync();
        }

        public async Task<Episode> GetEpisodeWithProductionCompanyAsync(Guid episodeId)
        {
            return await _databaseContext.MoviesAndEpisodes.Include(e => e.ProductionCompany).FirstOrDefaultAsync(e => e.Id == episodeId);
        }
    }
}
