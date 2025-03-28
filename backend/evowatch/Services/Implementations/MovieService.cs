using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Linq;

namespace evoWatch.Services.Implementations
{
    public class MovieService : IMovieService
    {
        private readonly IEpisodesRepository _episodesRepository;
        private readonly IFileSystemService _fileService;
        private readonly IWebHostEnvironment _env;
        private readonly IVideoStorageService _videoStorageService;

        public MovieService(
            IEpisodesRepository episodesRepository,
            IFileSystemService fileService,
            IWebHostEnvironment env,
            IConfiguration configuration,
            IVideoStorageService videoStorageService)
        {
            _episodesRepository = episodesRepository;
            _fileService = fileService;
            _env = env;
            _videoStorageService = videoStorageService;
        }

        public async Task<MovieDTO> GetMovieByIdAsync(Guid id)
        {
            var movie = await _episodesRepository.GetEpisodeByIdAsync(id);
            if(movie == null) throw new MovieNotFoundException();
            
            var dto = MovieDTO.CreateFromEpisodeDocument(movie);
            dto.ImdbRating = await GetImdbRatingAsync(dto.Title);
            return dto;
        }

        public async Task<IEnumerable<MovieDTO>> GetMoviesAsync()
        {
            var movies = await _episodesRepository.GetEpisodesAsync();
            return movies.Select(m => MovieDTO.CreateFromEpisodeDocument(m));
        }

        public async Task<MovieDTO> AddMovieAsync(MovieDTO movieDto, IFormFile? videoFile, IFormFile? coverImage)
        {
    
            if (videoFile != null && videoFile.Length > 0)
            {
                var savedVideoPath = await _videoStorageService.SaveVideoAsync(videoFile);
                movieDto.VideoPath = savedVideoPath;
            }
            else
            {
                movieDto.VideoPath = null; 
            }

            var newMovie = new Episode
            {
                Id = Guid.NewGuid(),
                Title = movieDto.Title,
                Genre = movieDto.Genre,
                ReleaseYear = movieDto.ReleaseYear,
                Description = movieDto.Description,
                Language = movieDto.Language,
                Award = movieDto.Award,
                VideoPath = movieDto.VideoPath, 
                IsMovie = true,
                Season = null,
                ProductionCompany = null,
                Person = new List<Person>(),
                Characters = new List<Character>()
            };


            if (coverImage != null && coverImage.Length > 0)
            {
                newMovie.CoverImagePath = await _fileService.SaveFileAsync(coverImage);
            }
            else
            {
              
                newMovie.CoverImagePath = "covernotfound.jpg";
            }

            var result = await _episodesRepository.AddEpisodeAsync(newMovie);
            return MovieDTO.CreateFromEpisodeDocument(result);
        }

        public async Task<MovieDTO> UpdateMovieAsync(Guid id, MovieDTO movieDto, IFormFile? newVideoFile, IFormFile? newCoverImage)
        {
            var existingMovie = await _episodesRepository.GetEpisodeByIdAsync(id);
            if (existingMovie == null || !existingMovie.IsMovie) throw new MovieNotFoundException();

            existingMovie.Title = !string.IsNullOrEmpty(movieDto.Title) ? movieDto.Title : existingMovie.Title;
            existingMovie.Genre = !string.IsNullOrEmpty(movieDto.Genre) ? movieDto.Genre : existingMovie.Genre;
            existingMovie.ReleaseYear = movieDto.ReleaseYear > 0 ? movieDto.ReleaseYear : existingMovie.ReleaseYear;
            existingMovie.Description = !string.IsNullOrEmpty(movieDto.Description) ? movieDto.Description : existingMovie.Description;
            existingMovie.Language = !string.IsNullOrEmpty(movieDto.Language) ? movieDto.Language : existingMovie.Language;
            existingMovie.Award = !string.IsNullOrEmpty(movieDto.Award) ? movieDto.Award : existingMovie.Award;

            existingMovie.CoverImagePath = (newCoverImage?.Length > 0) ? await _fileService.SaveFileAsync(newCoverImage) : existingMovie.CoverImagePath;

           
            existingMovie.VideoPath = (newVideoFile?.Length > 0)  ? await _videoStorageService.SaveVideoAsync(newVideoFile) : existingMovie.VideoPath;

            var result = await _episodesRepository.UpdateEpisodeAsync(existingMovie);
            return MovieDTO.CreateFromEpisodeDocument(result);
        }


        public async Task<bool> DeleteMovieAsync(Guid id)
        {
            var existingMovie = await _episodesRepository.GetEpisodeByIdAsync(id);
            if (existingMovie == null || !existingMovie.IsMovie) throw new MovieNotFoundException();
            return await _episodesRepository.DeleteEpisodeAsync(existingMovie);
        }

        private async Task<string> GetImdbRatingAsync(string title)
        {
            using (var client = new HttpClient())
            {
                var apiKey = Environment.GetEnvironmentVariable("OMDB_API_KEY");
                var url = $"https://www.omdbapi.com/?apikey={apiKey}&t={Uri.EscapeDataString(title)}&type=movie";

                var response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();

                    dynamic data = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                    if (data.Response == "True" && data.imdbRating != null)
                    {
                        return data.imdbRating;
                    }
                }
                return "N/A";
            }
        }
    }
}
