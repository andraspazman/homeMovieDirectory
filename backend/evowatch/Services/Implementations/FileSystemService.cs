using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing;

namespace evoWatch.Services.Implementations
{
    internal class FileSystemService : IFileSystemService
    {
        protected string? _basePath;

        private readonly string _externalFolderPath = @"D:\CoverImages";
        private readonly string[] _permittedExtensions = { ".jpg", ".jpeg", ".png" };

        public void Initialize(string basePath)
        {
            if (_basePath is not null)
            {
                throw new InvalidOperationException("FileSystemService has already been initialized.");
            }
            _basePath = Path.Combine("images", basePath);
            Directory.CreateDirectory(_basePath);
        }

        public FileStream Read(string filename)
        {
            if (_basePath is null)
            {
                throw new InvalidOperationException("FileSystemService has not been initialized.");
            }

            string filepath = Path.Combine(_basePath, filename);

            if (!File.Exists(filepath))
            {
                throw new FileNotFoundException("File not found.", filepath);
            }

            return File.OpenRead(filepath);
        }
        public async Task WriteAsync(string filename, Stream stream)
        {
            if (_basePath is null)
            {
                throw new InvalidOperationException("FileSystemService has not been initialized.");
            }


            string filepath = Path.Combine(_basePath, filename);

            using (var fileStream = new FileStream(filepath, FileMode.Create, FileAccess.Write))
            {
                await stream.CopyToAsync(fileStream);
            }
        }
        public void Delete(string filename)
        {
            if (_basePath is null)
            {
                throw new InvalidOperationException("FileSystemService has not been initialized.");
            }

            string filepath = Path.Combine(_basePath, filename);

            if (!File.Exists(filepath))
            {
                throw new FileNotFoundException("File not found.", filepath);
            }

            File.Delete(filepath);
        }


        public async Task<string?> SaveFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !_permittedExtensions.Contains(extension))
            {
                throw new Exception("Only PNG or JPG permitted.");
            }

            if (!Directory.Exists(_externalFolderPath))
            {
                Directory.CreateDirectory(_externalFolderPath);
            }

            var fileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(_externalFolderPath, fileName);

            // Betöltjük a képet a bejövő streamből
            using (var inputStream = file.OpenReadStream())
            using (var originalImage = Image.FromStream(inputStream))
            {
                int newWidth = 480;
                int newHeight = 800;

                // Új Bitmap létrehozása a kívánt méretekkel
                using (var resizedImage = new Bitmap(newWidth, newHeight))
                {
                    using (var graphics = Graphics.FromImage(resizedImage))
                    {
                        // Minőségi beállítások
                        graphics.CompositingQuality = CompositingQuality.HighQuality;
                        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        graphics.CompositingMode = CompositingMode.SourceCopy;

                        // Átméretezés
                        graphics.DrawImage(originalImage, 0, 0, newWidth, newHeight);
                    }

                    // Kép formátum meghatározása a kiterjesztés alapján
                    ImageFormat imageFormat = extension == ".png"
                        ? ImageFormat.Png
                        : ImageFormat.Jpeg;

                    // Átméretezett kép mentése
                    resizedImage.Save(filePath, imageFormat);
                }
            }

            return fileName;
        }
    }
}
