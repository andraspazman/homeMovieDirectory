using evoWatch.DTOs;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net.Mime;
using System.Threading.Tasks;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("playlist")]
    public class PlaylistController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        /// <summary>
        /// Retrieves the user's playlist.
        /// If the user does not have a playlist, a default one is created.
        /// </summary>
        /// <param name="userId">The user's unique identifier.</param>
        /// <returns>A PlaylistDTO representing the user's playlist.</returns>
        [HttpGet("user/{userId:guid}", Name = nameof(GetPlaylistByUserId))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(PlaylistDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPlaylistByUserId(Guid userId)
        {
            var result = await _playlistService.GetPlaylistByUserIdAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Adds a new item to the user's playlist.
        /// The request body must contain a valid PlaylistItemCreateDto.
        /// </summary>
        /// <param name="itemDto">The DTO containing information for the new playlist item.</param>
        /// <returns>A PlaylistItemDTO representing the created playlist item.</returns>
        [HttpPost("item", Name = nameof(AddPlaylistItem))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(PlaylistItemDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddPlaylistItem([FromBody] PlaylistItemCreateDTO itemDto)
        {
            var result = await _playlistService.AddPlaylistItemAsync(itemDto);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves all items from the specified playlist.
        /// </summary>
        /// <param name="playlistId">The unique identifier of the playlist.</param>
        /// <returns>A collection of PlaylistItemDTO objects.</returns>
        [HttpGet("{playlistId:guid}/items", Name = nameof(GetPlaylistItems))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<PlaylistItemDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPlaylistItems(Guid playlistId)
        {
            var result = await _playlistService.GetPlaylistItemsAsync(playlistId);
            return Ok(result);
        }

        /// <summary>
        /// Deletes a specified item from the playlist.
        /// </summary>
        /// <param name="playlistItemId">The unique identifier of the playlist item to delete.</param>
        /// <returns>An HTTP 200 OK response if deletion is successful; otherwise, an error response.</returns>
        [HttpDelete("item/{playlistItemId:guid}", Name = nameof(DeletePlaylistItem))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePlaylistItem(Guid playlistItemId)
        {
            try
            {
                var result = await _playlistService.DeletePlaylistItemAsync(playlistItemId);
                if (result)
                {
                    return Ok();
                }
                else
                {
                    return Problem("Failed to delete playlist item.", null, StatusCodes.Status500InternalServerError);
                }
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
