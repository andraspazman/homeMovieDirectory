using evoWatch.DTOs;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net.Mime;
using System.Threading.Tasks;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("latest")]
    public class LatestContentController : ControllerBase
    {
        private readonly ILatestContentService _latestContentService;

        public LatestContentController(ILatestContentService latestContentService)
        {
            _latestContentService = latestContentService;
        }

        /// <summary>
        /// Retrieves the latest content (movies and series).
        /// </summary>
        [HttpGet(Name = nameof(GetLatestContent))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<SearchResultDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLatestContent()
        {
            var result = await _latestContentService.GetLatestContentAsync();
            return Ok(result);
        }
    }
}
