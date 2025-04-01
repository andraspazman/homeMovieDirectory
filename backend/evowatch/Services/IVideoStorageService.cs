namespace evoWatch.Services
{
    public interface IVideoStorageService
    {
        Task<string> SaveVideoAsync(IFormFile file);
        Task DeleteVideoAsync(string filename);
    }
}
