using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace evoWatch.Services.Implementations
{
    public class VideoStorageService : IVideoStorageService
    {
        private readonly string _videoDirectory;

        public VideoStorageService(IConfiguration configuration)
        {
           
            _videoDirectory = configuration["FileStorage:VideoUploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "UploadedVideos");
            if (!Directory.Exists(_videoDirectory))
            {
                Directory.CreateDirectory(_videoDirectory);
            }
        }

        public async Task<string> SaveVideoAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Invalid file.");

            if (Path.GetExtension(file.FileName).ToLower() != ".mp4")
                throw new ArgumentException("Only MP4 files are allowed.");

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_videoDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }
    }
}
