using evoWatch.DTOs;
using Microsoft.AspNetCore.Http;

namespace evoWatch.Services
{
    public interface IMovieService
    {
        Task<MovieDTO> GetMovieByIdAsync(Guid id);
        Task<IEnumerable<MovieDTO>> GetMoviesAsync();
        Task<MovieDTO> AddMovieAsync(MovieDTO movieDto, IFormFile videoFile, IFormFile coverImage);
        Task<MovieDTO> UpdateMovieAsync(Guid id, MovieDTO movieDto, IFormFile newVideoFile, IFormFile newCoverImage);
        Task<bool> DeleteMovieAsync(Guid id);
    }
}
