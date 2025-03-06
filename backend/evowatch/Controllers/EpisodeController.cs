using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("episode")]
    public class EpisodeController : ControllerBase
    {
        private readonly IEpisodeService _episodeService;

        public EpisodeController(IEpisodeService episodeService)
        {
            _episodeService = episodeService;
        }

        /// <summary>
        /// List of all episodes for a given season.
        /// </summary>
        [HttpGet("season/{seasonId:guid}", Name = nameof(GetEpisodesBySeason))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<EpisodeDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEpisodesBySeason(Guid seasonId)
        {
            var episodes = await _episodeService.GetEpisodesAsync(seasonId);
            return Ok(episodes);
        }

        /// <summary>
        /// Retrieves an episode by its ID.
        /// </summary>
        [HttpGet("{id:guid}", Name = nameof(GetEpisodeById))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(EpisodeDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEpisodeById(Guid id)
        {
            try
            {
                var episode = await _episodeService.GetEpisodeByIdAsync(id);
                return Ok(episode);
            }
            catch (EpisodeNotFoundException)
            {
                return Problem($"Episode with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Adds a new episode to an existing season with a video upload.
        /// </summary>
        /// <param name="episodeDto">The episode data to add. Must include a valid SeasonId.</param>
        /// <param name="videoFile">The video file (MP4) to upload.</param>
        [HttpPost(Name = nameof(AddEpisode))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(EpisodeDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddEpisode([FromForm] EpisodeDTO episodeDto, IFormFile? videoFile)
        {
            if (episodeDto == null)
            {
                return BadRequest("Episode data is required.");
            }

            // Videó fájl esetén opcionálisan ellenőrizhetjük a kiterjesztést, pl. csak MP4 megengedett.
            if (videoFile != null && videoFile.Length > 0)
            {
                var extension = Path.GetExtension(videoFile.FileName).ToLower();
                if (extension != ".mp4")
                {
                    return BadRequest("Only MP4 files are allowed.");
                }
            }

            var result = await _episodeService.AddEpisodeAsync(episodeDto, videoFile);
            return Ok(new { Message = "Episode added successfully", Episode = result });
        }

        /// <summary>
        /// Updates an existing episode.
        /// </summary>
        [HttpPut("{id:guid}", Name = nameof(UpdateEpisode))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(EpisodeDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateEpisode(Guid id, [FromForm] EpisodeDTO episodeDto, IFormFile? newVideoFile)
        {
            try
            {
                var result = await _episodeService.UpdateEpisodeAsync(id, episodeDto, newVideoFile);
                return Ok(result);
            }
            catch (EpisodeNotFoundException)
            {
                return Problem($"Episode with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Deletes an episode.
        /// </summary>
        [HttpDelete("{id:guid}", Name = nameof(DeleteEpisode))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteEpisode(Guid id)
        {
            try
            {
                var result = await _episodeService.DeleteEpisodeAsync(id);
                if (!result)
                {
                    return Problem("Failed to delete episode", null, StatusCodes.Status500InternalServerError);
                }
                else
                {
                    return Ok();
                }
            }
            catch (EpisodeNotFoundException)
            {
                return Problem($"Episode with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Creates a new person and assigns it to an existing episode.
        /// </summary>
        /// <param name="episodeId">The ID of the episode.</param>
        /// <param name="personDto">The person data to create.</param>
        [HttpPost("{episodeId:guid}/person", Name = nameof(CreateAndAddPersonToEpisode))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(EpisodeDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateAndAddPersonToEpisode(Guid episodeId, [FromBody] PersonDTO personDto)
        {
            if (personDto == null)
            {
                return BadRequest("Person data is required.");
            }

            try
            {
                var updatedEpisode = await _episodeService.CreateAndAddPersonToEpisodeAsync(episodeId, personDto);
                return Ok(new { Message = "Person created and added to episode successfully", Episode = updatedEpisode });
            }
            catch (EpisodeNotFoundException ex)
            {
                return Problem(ex.Message, null, StatusCodes.Status404NotFound);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message, null, StatusCodes.Status500InternalServerError);
            }
        }

        /// <summary>
        /// Retrieves the list of persons assigned to a given episode.
        /// </summary>
        [HttpGet("{episodeId:guid}/persons", Name = nameof(GetPersonsByEpisode))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<PersonDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPersonsByEpisode(Guid episodeId)
        {
            try
            {
                var persons = await _episodeService.GetPersonsByEpisodeIdAsync(episodeId);
                return Ok(persons);
            }
            catch (EpisodeNotFoundException ex)
            {
                return Problem(ex.Message, null, StatusCodes.Status404NotFound);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message, null, StatusCodes.Status500InternalServerError);
            }
        }

        /// <summary>
        /// Assigns a production company to the specified episode based on the provided ProductionCompanyDTO.
        /// </summary>
        /// <param name="episodeId">The ID of the episode</param>
        /// <param name="productionCompanyDto">The DTO containing production company details</param>
        /// <returns>The updated EpisodeDTO containing the assigned production company</returns>
        [HttpPost("{episodeId}/productioncompany")]
        public async Task<IActionResult> AddProductionCompanyToEpisode(Guid episodeId, [FromBody] ProductionCompanyDTO productionCompanyDto)
        {
            // Check if the production company data is provided
            if (productionCompanyDto == null)
            {
                return BadRequest("Production company data is required.");
            }

            try
            {
                // Call the service method to assign the production company to the episode
                var updatedEpisode = await _episodeService.AddProductionCompanyToEpisodeAsync(episodeId, productionCompanyDto);
                return Ok(updatedEpisode);
            }
            catch (Exception ex)
            {
                // Handle exceptions (e.g., logging) and return an appropriate error message
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Retrieves the production company for the specified episode.
        /// </summary>
        /// <param name="episodeId">The ID of the episode.</param>
        /// <returns>A ProductionCompanyDTO with production company details.</returns>
        [HttpGet("{episodeId}/productioncompany")]
        public async Task<IActionResult> GetProductionCompanyByEpisodeId(Guid episodeId)
        {
            try
            {
                var productionCompanyDto = await _episodeService.GetProductionCompanyByEpisodeIdAsync(episodeId);
                return Ok(productionCompanyDto);
            }
            catch (Exception ex)
            {
                // Return a 404 if the episode or production company is not found
                return NotFound(ex.Message);
            }
        }
    }
}
