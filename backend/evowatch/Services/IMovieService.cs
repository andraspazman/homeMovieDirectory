namespace evoWatch.Services
{
    public interface IMovieService
    {
        Task<string> SaveVideoAsync(IFormFile file);
    }
}
