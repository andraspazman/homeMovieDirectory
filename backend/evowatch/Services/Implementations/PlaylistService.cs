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
        private readonly ISeriesRepository _seriesRepository;

        public PlaylistService(
            IPlaylistRepository playlistRepository,
            IPlaylistItemRepository playlistItemRepository,
            ISeriesRepository seriesRepository)
        {
            _playlistRepository = playlistRepository;
            _playlistItemRepository = playlistItemRepository;
            _seriesRepository = seriesRepository;
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
            // 1) Ellenőrizd, hogy a felhasználó
            //    legalább az egyik mezőt (MoviesAndEpisodesId / SeriesId) megadta
            if (itemDto.MoviesAndEpisodesId == null && itemDto.SeriesId == null)
            {
                throw new Exception("Legalabb a 'MoviesAndEpisodesId' vagy a 'SeriesId' mezot ki kell tolteni!");
            }

            // 2) Ellenőrizd, hogy egyszerre ne lehessen kitöltve mindkettő
            if (itemDto.MoviesAndEpisodesId != null && itemDto.SeriesId != null)
            {
                throw new Exception("Egyszerre nem adhato meg a 'MoviesAndEpisodesId' és a 'SeriesId'. Csak az egyik mezot hasznald!");
            }

            // 3) Ha a SeriesId nem null, akkor ellenőrizd, hogy létező sorozatra mutat-e
            if (itemDto.SeriesId != null)
            {
                var series = await _seriesRepository.GetSeriesByIdAsync(itemDto.SeriesId.Value);
                if (series == null)
                {
                    throw new Exception("A megadott sorozat nem létezik az adatbázisban.");
                }
            }

            // 4) Megkeressük a megadott Playlist-et. Ha nem létezik, létrehozunk egyet automatikusan
            var playlist = await _playlistRepository.GetPlaylistByIdAsync(itemDto.PlaylistId);
            if (playlist == null)
            {
                playlist = new Playlist
                {
                    Id = Guid.NewGuid(),
                    UserId = itemDto.UserId,
                    PlaylistItems = new List<PlaylistItem>()
                };

                playlist = await _playlistRepository.AddPlaylistAsync(playlist);
                // Frissítjük a DTO PlaylistId mezőjét az új értékkel
                itemDto.PlaylistId = playlist.Id;
            }

            // 5) Létrehozzuk az új PlaylistItem-et
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

        public async Task<IEnumerable<PlaylistItemDTO>> GetAllPlaylistItemsForUserAsync(Guid userId)
        {
                // 1) Lekérdezzük a felhasználóhoz tartozó összes playlistet
                var playlists = await _playlistRepository.GetPlaylistsByUserIdAsync(userId);

                // Ha nincs egyetlen playlist sem, akkor üres listát adunk vissza
                if (!playlists.Any())
                {
                    return Enumerable.Empty<PlaylistItemDTO>();
                }

                // 2) Összegyűjtjük a playlist itemeket a talált playlistek alapján
                var allItems = new List<PlaylistItem>();

                foreach (var playlist in playlists)
                {
                    // Lekérjük az aktuális playlist összes elemét
                    var items = await _playlistItemRepository.GetPlaylistItemsByPlaylistIdAsync(playlist.Id);
                    allItems.AddRange(items);
                }

                // 3) PlaylistItem -> PlaylistItemDTO konverzió
                var result = allItems
                    .Select(PlaylistItemDTO.CreateFromPlaylistItem)
                    .ToList();

                return result;
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
