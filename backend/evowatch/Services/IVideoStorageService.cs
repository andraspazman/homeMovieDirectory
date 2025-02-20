namespace evoWatch.Services
{
    public interface IVideoStorageService
    {
        Task<string> SaveVideoAsync(IFormFile file);
    }
}
