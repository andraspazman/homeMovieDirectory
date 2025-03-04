using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories
{
    public interface IEpisodesRepository
    {
        Task<Episode> AddEpisodeAsync(Episode episode);
        Task<IEnumerable<Episode>> GetEpisodesAsync();
        Task<Episode?> GetEpisodeByIdAsync(Guid id);
        Task<Episode> UpdateEpisodeAsync(Episode episode);
        Task<bool> DeleteEpisodeAsync(Episode episode);
        Task<Episode?> GetEpisodeByIdWithPersonsAsync(Guid id);
    }
}
