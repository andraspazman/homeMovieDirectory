using evoWatch.Database.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class PlaylistItemRepository : IPlaylistItemRepository
    {
        private readonly DatabaseContext _databaseContext;

        public PlaylistItemRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<PlaylistItem> AddPlaylistItemAsync(PlaylistItem item)
        {
            var result = await _databaseContext.PlaylistItems.AddAsync(item);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<IEnumerable<PlaylistItem>> GetPlaylistItemsByPlaylistIdAsync(Guid playlistId)
        {
            return await _databaseContext.PlaylistItems
                .Where(pi => pi.PlaylistId == playlistId)
                .Include(pi => pi.Episodes)
                .Include(pi => pi.Series)
                .ToListAsync();
        }

        public async Task<PlaylistItem?> GetPlaylistItemByIdAsync(Guid playlistItemId)
        {
            return await _databaseContext.PlaylistItems
                .Include(pi => pi.Episodes)
                .Include(pi => pi.Series)
                .FirstOrDefaultAsync(pi => pi.Id == playlistItemId);
        }

        public async Task<bool> DeletePlaylistItemAsync(PlaylistItem item)
        {
            try
            {
                _databaseContext.PlaylistItems.Remove(item);
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
