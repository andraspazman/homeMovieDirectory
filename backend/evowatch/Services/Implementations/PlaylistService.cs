using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions; // Ha egyedi exceptionokat használsz
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace evoWatch.Services.Implementations
{
    public class PlaylistService : IPlaylistService
    {
        private readonly IPlaylistRepository _playlistRepository;
        private readonly IPlaylistItemRepository _playlistItemRepository;

        public PlaylistService(
            IPlaylistRepository playlistRepository,
            IPlaylistItemRepository playlistItemRepository)
        {
            _playlistRepository = playlistRepository;
            _playlistItemRepository = playlistItemRepository;
        }

        /// <summary>
        /// Lekérdezi a felhasználó lejátszási listáját. Ha a felhasználónak még nincs lejátszási listája, akkor létrehoz egy alapértelmezettat.
        /// </summary>
        public async Task<PlaylistDTO> GetPlaylistByUserIdAsync(Guid userId)
        {
            var playlists = await _playlistRepository.GetPlaylistsByUserIdAsync(userId);
            var playlist = playlists.FirstOrDefault();

            if (playlist == null)
            {
                // Ha nincs lejátszási lista, létrehozunk egy alapértelmezettet
                playlist = new Playlist
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    PlaylistItems = new List<PlaylistItem>()
                };

                playlist = await _playlistRepository.AddPlaylistAsync(playlist);
            }

            return PlaylistDTO.CreateFromPlaylist(playlist);
        }

        /// <summary>
        /// Új elemet ad a lejátszási listához. Az elem lehet filmes/epizód (MoviesAndEpisodesId kitöltve) vagy sorozat (SeriesId kitöltve).
        /// Legalább az egyik mezőnek nem szabad nullnak lennie.
        /// </summary>
        public async Task<PlaylistItemDTO> AddPlaylistItemAsync(PlaylistItemCreateDTO itemDto)
        {
            if (itemDto.MoviesAndEpisodesId == null && itemDto.SeriesId == null)
            {
                throw new ArgumentException("Either MoviesAndEpisodesId or SeriesId must be provided.");
            }

            var newItem = new PlaylistItem
            {
                Id = Guid.NewGuid(),
                PlaylistId = itemDto.PlaylistId,
                MoviesAndEpisodesId = itemDto.MoviesAndEpisodesId,
                SeriesId = itemDto.SeriesId
            };

            var result = await _playlistItemRepository.AddPlaylistItemAsync(newItem);
            return PlaylistItemDTO.CreateFromPlaylistItem(result);
        }

        /// <summary>
        /// Lekérdezi a megadott lejátszási lista összes elemét.
        /// </summary>
        public async Task<IEnumerable<PlaylistItemDTO>> GetPlaylistItemsAsync(Guid playlistId)
        {
            var items = await _playlistItemRepository.GetPlaylistItemsByPlaylistIdAsync(playlistId);
            return items.Select(PlaylistItemDTO.CreateFromPlaylistItem);
        }

        /// <summary>
        /// Törli a megadott azonosítójú playlist elemet.
        /// </summary>
        public async Task<bool> DeletePlaylistItemAsync(Guid playlistItemId)
        {
            // Feltételezzük, hogy a repository tartalmaz egy metódust a playlist elem lekérdezésére az azonosító alapján.
            var item = await _playlistItemRepository.GetPlaylistItemByIdAsync(playlistItemId);
            if (item == null)
            {
                // Itt akár egy egyedi exception is dobható, pl. PlaylistItemNotFoundException
                throw new Exception("Playlist item not found.");
            }

            return await _playlistItemRepository.DeletePlaylistItemAsync(item);
        }
    }
}
