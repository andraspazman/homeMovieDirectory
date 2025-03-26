using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories
{
    public interface IPlaylistRepository
    {
        Task<Playlist> AddPlaylistAsync(Playlist playlist);

        Task<Playlist?> GetPlaylistByIdAsync(Guid id);

        Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId);
      
        Task<Playlist> UpdatePlaylistAsync(Playlist playlist);

        Task<bool> DeletePlaylistAsync(Playlist playlist);
    }
}
