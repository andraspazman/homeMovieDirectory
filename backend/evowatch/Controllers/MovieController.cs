using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("movie")]
    public class MovieController : ControllerBase
    {
        private readonly IMovieService _movieService;

        public MovieController(IMovieService movieService)
        {
            _movieService = movieService;
        }

        /// <summary>
        /// List of all movies.
        /// </summary>
        [HttpGet(Name = nameof(GetMovies))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<MovieDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovies()
        {
            var result = await _movieService.GetMoviesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a movie by its ID.
        /// </summary>
        [HttpGet("{id:guid}", Name = nameof(GetMovieById))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(MovieDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMovieById(Guid id)
        {
            try
            {
                var result = await _movieService.GetMovieByIdAsync(id);
                return Ok(result);
            }
            catch (MovieNotFoundException)
            {
                return Problem($"Movie with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Adds a new movie with a video upload.
        /// </summary>
        /// <param name="movieDto">The movie data to add.</param>
        /// <param name="videoFile">The video file (MP4) to upload.</param>
        [HttpPost(Name = nameof(AddMovie))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(MovieDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddMovie([FromForm] MovieDTO movieDto, IFormFile videoFile, IFormFile coverImage)
        {
            if (movieDto == null)
            {
                return BadRequest("Movie data is required.");
            }

            if (videoFile == null || videoFile.Length == 0)
            {
                return BadRequest("Video file is required.");
            }

            var extension = Path.GetExtension(videoFile.FileName).ToLower();
            if (extension != ".mp4")
            {
                return BadRequest("Only MP4 files are allowed.");
            }

            var result = await _movieService.AddMovieAsync(movieDto, videoFile, coverImage);
            return Ok(new { Message = "Movie added successfully", Movie = result });
        }

        /// <summary>
        /// Update a movie.
        /// </summary>
        [HttpPut("{id:guid}", Name = nameof(UpdateMovie))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(MovieDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMovie( Guid id, [FromForm] MovieDTO movieDto, IFormFile? newVideoFile, IFormFile? newCoverImage)
        {
            try
            {
                var result = await _movieService.UpdateMovieAsync(id, movieDto, newVideoFile, newCoverImage);
                return Ok(result);
            }
            catch (MovieNotFoundException)
            {
                return Problem($"Movie with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }

        /// <summary>
        /// Deletes a movie.
        /// </summary>
        [HttpDelete("{id:guid}", Name = nameof(DeleteMovie))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteMovie(Guid id)
        {
            try
            {
                var result = await _movieService.DeleteMovieAsync(id);
                if (!result)
                {
                    return Problem("Failed to delete", null, StatusCodes.Status500InternalServerError);
                }
                else
                {
                    return Ok();
                }
            }
            catch (MovieNotFoundException)
            {
                return Problem($"Movie with specified ID: {id} not found", null, StatusCodes.Status404NotFound);
            }
        }
       
    }
}
