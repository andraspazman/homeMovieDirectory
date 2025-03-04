using evoWatch.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using evoWatch.DTOs;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("search")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

     
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        /// <summary>
        /// Searches for movies and series based on a title query.
        /// </summary>
        /// <param name="q">The search query parameter representing a part of the title.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a collection of search results if found.
        /// </returns>
        /// <response code="200">Returns the search results.</response>
        /// <response code="400">If the query parameter is missing or empty.</response>
        [HttpGet(Name = nameof(Search))]
        [ProducesResponseType(typeof(IEnumerable<SearchResultDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            // Validate the search query parameter
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("Query parameter is required.");
            }

            // Use the search service to perform the search based on title
            var results = await _searchService.SearchByTitleAsync(q);
            return Ok(results);
        }
    }
}
