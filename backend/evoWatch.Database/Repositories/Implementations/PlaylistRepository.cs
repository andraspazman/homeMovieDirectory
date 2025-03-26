using evoWatch.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class PlaylistRepository : IPlaylistRepository
    {
        private readonly DatabaseContext _databaseContext;

        public PlaylistRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<Playlist> AddPlaylistAsync(Playlist playlist)
        {
            var result = await _databaseContext.Playlists.AddAsync(playlist);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<Playlist?> GetPlaylistByIdAsync(Guid id)
        {
            return await _databaseContext.Playlists.FindAsync(id);
        }

        public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId)
        {
            return await _databaseContext.Playlists
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }

        public async Task<Playlist> UpdatePlaylistAsync(Playlist playlist)
        {
            var result = _databaseContext.Playlists.Update(playlist);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeletePlaylistAsync(Playlist playlist)
        {
            try
            {
                _databaseContext.Playlists.Remove(playlist);
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
