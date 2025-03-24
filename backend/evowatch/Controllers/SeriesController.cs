using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("series")]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesService _seriesService;

        public SeriesController(ISeriesService seriesService)
        {
            _seriesService = seriesService;
        }

        /// <summary>
        /// Gets a list of all series.
        /// </summary>
        [HttpGet(Name = nameof(GetSeries))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<SeriesDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSeries()
        {
            var result = await _seriesService.GetSeriesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets a series by its ID.
        /// </summary>
        [HttpGet("{id:guid}", Name = nameof(GetSeriesById))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(SeriesDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSeriesById(Guid id)
        {
            try
            {
                var result = await _seriesService.GetSeriesByIdAsync(id);
                return Ok(result);
            }
            catch (SeriesNotFoundException)
            {
                return Problem($"Series with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Adds a new series with an optional cover image.
        /// </summary>
        /// <param name="series">The series data to add.</param>
        /// <param name="coverImage">The cover image file (optional).</param>
        [HttpPost(Name = nameof(AddSeries))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(SeriesDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddSeries([FromForm] SeriesDTO series, IFormFile? coverImage)
        {
            var result = await _seriesService.AddSeriesAsync(series, coverImage);
            return Ok(result);
        }

        [HttpPut("{id:guid}", Name = nameof(UpdateSeries))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(SeriesDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateSeries(Guid id, [FromForm] SeriesDTO series,  IFormFile? coverImage)
        {
            try
            {
                var result = await _seriesService.UpdateSeriesAsync(id, series, coverImage);
                return Ok(result);
            }
            catch (SeriesNotFoundException)
            {
                return Problem($"Series with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Deletes a series.
        /// </summary>
        [HttpDelete("{id:guid}", Name = nameof(DeleteSeriesAsync))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteSeriesAsync(Guid id)
        {
            try
            {
                var result = await _seriesService.DeleteSeriesAsync(id);
                if (!result)
                {
                    return Problem("Failed to delete", null, StatusCodes.Status500InternalServerError);
                }
                else
                {
                    return Ok();
                }
            }
            catch (SeriesNotFoundException)
            {
                return Problem($"Series with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Gets the EP1 episode ID from a series by series ID.
        /// </summary>
        [HttpGet("{id:guid}/ep1-id", Name = nameof(GetEp1EpisodeId))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(EpisodeIdDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEp1EpisodeId(Guid id)
        {
            try
            {
                var result = await _seriesService.GetEp1EpisodeIdAsync(id);
                return Ok(result);
            }
            catch (SeriesNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (EpisodeNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

    }
}
