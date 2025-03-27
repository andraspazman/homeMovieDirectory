using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories
{
    public interface IPlaylistItemRepository
    {
      
        Task<PlaylistItem> AddPlaylistItemAsync(PlaylistItem item);

        Task<IEnumerable<PlaylistItem>> GetPlaylistItemsByPlaylistIdAsync(Guid playlistId);

        Task<PlaylistItem?> GetPlaylistItemByIdAsync(Guid playlistItemId);

        Task<bool> DeletePlaylistItemAsync(PlaylistItem item);
    }
}
