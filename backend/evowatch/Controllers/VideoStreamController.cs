using Microsoft.AspNetCore.Mvc;
using evoWatch.Services;
using System.IO;
using System.Threading.Tasks;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("video")]
    public class VideoStreamController : ControllerBase
    {
        private readonly IMovieService _movieService;
        private readonly IVideoStreamingService _videoStreamingService;

        public VideoStreamController(IMovieService movieService, IVideoStreamingService videoStreamingService)
        {
            _movieService = movieService;
            _videoStreamingService = videoStreamingService;
        }

        /// <summary>
        /// Stream the movie by id.
        /// </summary>
        /// <param name="movieId">The movie id</param>
        /// <returns>Stream video</returns>
        [HttpGet("{movieId:guid}")]
        public async Task<IActionResult> StreamMovieVideo(Guid movieId)
        {
            var movie = await _movieService.GetMovieByIdAsync(movieId);
            if (movie == null)
                return NotFound("File not found.");

            if (string.IsNullOrEmpty(movie.VideoPath))
                return NotFound("Not file attached.");

            try
            {
                var stream = _videoStreamingService.GetVideoFileStream(movie.VideoPath);
                return File(stream, "video/mp4", enableRangeProcessing: true);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found on the server.");
            }
        }
    }
}
