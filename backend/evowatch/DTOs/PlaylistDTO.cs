using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace evoWatch.DTOs
{
    public class PlaylistDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public IEnumerable<PlaylistItemDTO> PlaylistItems { get; set; } = new List<PlaylistItemDTO>();

        public static PlaylistDTO CreateFromPlaylist(Playlist playlist)
        {
            return new PlaylistDTO
            {
                Id = playlist.Id,
                UserId = playlist.UserId,
                PlaylistItems = playlist.PlaylistItems?.Select(pi => PlaylistItemDTO.CreateFromPlaylistItem(pi)).ToList() ?? new List<PlaylistItemDTO>()
            };
        }
    }
}
