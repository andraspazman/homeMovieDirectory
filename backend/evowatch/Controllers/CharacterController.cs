using evoWatch.DTOs;
using evoWatch.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("character")]
    public class CharacterController : ControllerBase
    {
        private readonly ICharacterService _characterService;

        public CharacterController(ICharacterService characterService)
        {
            _characterService = characterService;
        }

        /// <summary>
        /// Adds a new character to the specified episode.
        /// </summary>
        /// <param name="episodeId">The ID of the episode</param>
        /// <param name="characterDto">The character data to add</param>
        /// <returns>The updated EpisodeDTO including the added character</returns>
        [HttpPost("episode/{episodeId}")]
        public async Task<IActionResult> CreateCharacterForEpisode(Guid episodeId, [FromBody] CharacterDTO characterDto)
        {
            if (characterDto == null)
            {
                return BadRequest("Character data is required.");
            }

            try
            {
                var updatedEpisode = await _characterService.CreateAndAddCharacterToEpisodeAsync(episodeId, characterDto);
                return Ok(updatedEpisode);
            }
            catch (Exception ex)
            {
                // It is recommended to handle specific exceptions and log errors appropriately
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Gets the list of characters (with their associated persons) for the specified episode.
        /// </summary>
        /// <param name="episodeId">The ID of the episode</param>
        /// <returns>A collection of CharacterDTO objects</returns>
        [HttpGet("episode/{episodeId}/characters")]
        public async Task<IActionResult> GetCharactersForEpisode(Guid episodeId)
        {
            try
            {
                var characters = await _characterService.GetCharactersByEpisodeIdAsync(episodeId);
                return Ok(characters);
            }
            catch (Exception ex)
            {
                // Handle exceptions accordingly (e.g. logging)
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Retrieves persons and their associated characters for the specified episode.
        /// </summary>
        /// <param name="episodeId">The ID of the episode</param>
        /// <returns>A collection of PersonWithCharactersDTO</returns>
        [HttpGet("episode/{episodeId}/persons-with-characters")]
        public async Task<IActionResult> GetPersonsWithCharacters(Guid episodeId)
        {
            try
            {
                var result = await _characterService.GetPersonsWithCharactersByEpisodeIdAsync(episodeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Handle exceptions accordingly (e.g., log the error, return specific status codes, etc.)
                return NotFound(ex.Message);
            }
        }
    }
}
