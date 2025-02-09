using Microsoft.AspNetCore.Mvc;
using evoWatch.Services;

namespace evoWatch.Controllers
{
    public class MovieController : ControllerBase
    {
        private readonly string _videoUploadPath;

        public MovieController(IConfiguration configuration)
        {
            _videoUploadPath = configuration["FileStorage:VideoUploadPath"] ?? "D:\\Videok";
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".mp4")
            {
                return BadRequest("Only MP4 files are allowed.");
            }

            // 📌 Külső könyvtár beolvasása az appsettings.json-ből
            if (!Directory.Exists(_videoUploadPath))
            {
                Directory.CreateDirectory(_videoUploadPath);
            }

            string uniqueFileName = $"{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(_videoUploadPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { Message = "File uploaded successfully", FilePath = filePath });
        }
    }
}
