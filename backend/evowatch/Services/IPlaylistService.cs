using evoWatch.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Services
{
    public interface IPlaylistService
    {
 
        Task<PlaylistDTO> GetPlaylistByUserIdAsync(Guid userId);

        Task<PlaylistItemDTO> AddPlaylistItemAsync(PlaylistItemCreateDTO itemDto);

        Task<IEnumerable<PlaylistItemDTO>> GetPlaylistItemsAsync(Guid playlistId);

        Task<bool> DeletePlaylistItemAsync(Guid playlistItemId);

        Task<IEnumerable<PlaylistItemDTO>> GetAllPlaylistItemsForUserAsync(Guid userId);
    }
}
