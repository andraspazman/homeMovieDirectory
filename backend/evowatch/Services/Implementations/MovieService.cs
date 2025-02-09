namespace evoWatch.Services.Implementations
{
    public class MovieService : IMovieService
    {
        private readonly string _videoDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedVideos");

        public MovieService()
        {
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

            var filePath = Path.Combine(_videoDirectory, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return filePath;
        }
    }
}
