using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions; // If you have custom exceptions
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


        public async Task<PlaylistDTO> GetPlaylistByUserIdAsync(Guid userId)
        {
            // Attempt to find any existing playlist(s) for the user
            var playlists = await _playlistRepository.GetPlaylistsByUserIdAsync(userId);
            var playlist = playlists.FirstOrDefault();

            // If the user doesn't have a playlist, create a new default one
            if (playlist == null)
            {
                playlist = new Playlist
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    PlaylistItems = new List<PlaylistItem>()
                };

                playlist = await _playlistRepository.AddPlaylistAsync(playlist);
            }

            // Convert the entity to a DTO
            return PlaylistDTO.CreateFromPlaylist(playlist);
        }


        public async Task<PlaylistItemDTO> AddPlaylistItemAsync(PlaylistItemCreateDTO itemDto)
        {
            // (1) Ensure that the user provided at least one field: MoviesAndEpisodesId or SeriesId
            if (itemDto.MoviesAndEpisodesId == null && itemDto.SeriesId == null)
            {
                throw new Exception("At least one field (MoviesAndEpisodesId or SeriesId) must be provided!");
            }

            // (2) Ensure both fields aren't provided simultaneously
            if (itemDto.MoviesAndEpisodesId != null && itemDto.SeriesId != null)
            {
                throw new Exception("MoviesAndEpisodesId and SeriesId cannot both be set. Please specify only one.");
            }

            // (3) If SeriesId is provided, check that the corresponding series actually exists
            if (itemDto.SeriesId != null)
            {
                var series = await _seriesRepository.GetSeriesByIdAsync(itemDto.SeriesId.Value);
                if (series == null)
                {
                    throw new SeriesNotFoundException();
                }
            }

            // (4) Attempt to retrieve the specified playlist. If it doesn't exist, automatically create one.
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
                // Update the DTO's PlaylistId with the newly created playlist's ID
                itemDto.PlaylistId = playlist.Id;
            }

            // (5) Create the new PlaylistItem
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


        public async Task<IEnumerable<PlaylistItemDTO>> GetPlaylistItemsAsync(Guid playlistId)
        {
            var items = await _playlistItemRepository.GetPlaylistItemsByPlaylistIdAsync(playlistId);
            return items.Select(PlaylistItemDTO.CreateFromPlaylistItem);
        }


        public async Task<IEnumerable<PlaylistItemDTO>> GetAllPlaylistItemsForUserAsync(Guid userId)
        {
            // Retrieve all playlists belonging to the user
            var playlists = await _playlistRepository.GetPlaylistsByUserIdAsync(userId);

            // If the user has no playlists, return an empty list
            if (!playlists.Any())
            {
                return Enumerable.Empty<PlaylistItemDTO>();
            }

            //  Collect items from each of the playlists found
            var allItems = new List<PlaylistItem>();
            foreach (var playlist in playlists)
            {
                var items = await _playlistItemRepository.GetPlaylistItemsByPlaylistIdAsync(playlist.Id);
                allItems.AddRange(items);
            }

            // Convert the combined items into DTOs
            var result = allItems.Select(PlaylistItemDTO.CreateFromPlaylistItem).ToList();

            return result;
        }


        public async Task<bool> DeletePlaylistItemAsync(Guid playlistItemId)
        {
            // We assume the repository has a method for retrieving a playlist item by ID.
            var item = await _playlistItemRepository.GetPlaylistItemByIdAsync(playlistItemId);
            if (item == null)
            {
                throw new PlaylistItemNotFoundException();
            }

            return await _playlistItemRepository.DeletePlaylistItemAsync(item);
        }
    }
}
