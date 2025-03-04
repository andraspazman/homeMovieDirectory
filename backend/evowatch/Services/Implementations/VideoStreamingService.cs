using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace evoWatch.Services.Implementations
{
    public class VideoStreamingService : IVideoStreamingService
    {
        private readonly string _videoDirectory;

        public VideoStreamingService(IConfiguration configuration)
        {
            _videoDirectory = configuration["FileStorage:VideoUploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "UploadedVideos");
        }

        public FileStream GetVideoFileStream(string videoFileName)
        {
            var filePath = Path.Combine(_videoDirectory, videoFileName);
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Video file '{videoFileName}' not found.", filePath);
            }

            return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        }
    }
}
