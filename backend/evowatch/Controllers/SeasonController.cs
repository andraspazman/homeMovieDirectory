using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("seasons")]
    public class SeasonController : ControllerBase
    {
        private readonly ISeasonService _seasonService;

        public SeasonController(ISeasonService seasonService)
        {
            _seasonService = seasonService;
        }

        /// <summary>
        /// Adds a new season to an existing series.
        /// </summary>
        /// <param name="seriesId">The ID of the series.</param>
        /// <param name="seasonDto">The season data.</param>
        [HttpPost("addtoseries/{seriesId:guid}")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(SeasonDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddSeasonToSeries(Guid seriesId, [FromBody] SeasonDTO seasonDto)
        {
            try
            {
                var season = await _seasonService.AddSeasonToSeriesAsync(seriesId, seasonDto);
                return Ok(season);
            }
            catch (SeriesNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


    }
}
