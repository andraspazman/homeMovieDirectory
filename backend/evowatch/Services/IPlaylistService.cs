using evoWatch.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Services
{
    public interface IPlaylistService
    {
        // Lekérdezi a felhasználó lejátszási listáját (létrehozza, ha még nem létezik)
        Task<PlaylistDTO> GetPlaylistByUserIdAsync(Guid userId);

        // Új elemet ad a lejátszási listához
        Task<PlaylistItemDTO> AddPlaylistItemAsync(PlaylistItemCreateDTO itemDto);

        // Lekérdezi egy adott lejátszási lista összes elemét
        Task<IEnumerable<PlaylistItemDTO>> GetPlaylistItemsAsync(Guid playlistId);

        // Töröl egy elemet a lejátszási listából
        Task<bool> DeletePlaylistItemAsync(Guid playlistItemId);
    }
}
