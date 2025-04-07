using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;
using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;
using evoWatch.Services.Implementations;

namespace movieDirectoryBackend.Test
{
    public class SeriesServiceTests
    {
        private readonly Mock<ISeriesRepository> _seriesRepositoryMock;
        private readonly Mock<ISeasonsRepository> _seasonsRepositoryMock;
        private readonly Mock<IEpisodesRepository> _episodesRepositoryMock;
        private readonly Mock<IMovieService> _movieServiceMock;
        private readonly Mock<IWebHostEnvironment> _envMock;
        private readonly Mock<IFileSystemService> _fileServiceMock;
        private readonly Mock<IImdbRatingService> _imdbRatingServiceMock;
        private readonly SeriesService _seriesService;

        public SeriesServiceTests()
        {
            _seriesRepositoryMock = new Mock<ISeriesRepository>();
            _seasonsRepositoryMock = new Mock<ISeasonsRepository>();
            _episodesRepositoryMock = new Mock<IEpisodesRepository>();
            _movieServiceMock = new Mock<IMovieService>();
            _envMock = new Mock<IWebHostEnvironment>();
            _fileServiceMock = new Mock<IFileSystemService>();
            _imdbRatingServiceMock = new Mock<IImdbRatingService>();

            _seriesService = new SeriesService(
                _seriesRepositoryMock.Object,
                _movieServiceMock.Object,
                _envMock.Object,
                _fileServiceMock.Object,
                _seasonsRepositoryMock.Object,
                _episodesRepositoryMock.Object,
                _imdbRatingServiceMock.Object
            );
        }

        [Fact]
        public async Task GetSeriesByIdAsync_ReturnsSeriesDTO_WhenSeriesExists()
        {
            // Arrange ,create series object 
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "test Series",
                Genre = "horror",
                ReleaseYear = 2001,
                FinalYear = null,
                Description = "Test Description",
                CoverImagePath = "img.jpg"
            };

            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync(series); //setr mocked service
            _imdbRatingServiceMock.Setup(s => s.GetImdbRatingAsync(series.Title)).ReturnsAsync("8.5");

            // Act, call the selected methot to test
            var result = await _seriesService.GetSeriesByIdAsync(seriesId); 

            // Assert ,chech the returned value, id and title
            Assert.NotNull(result);
            Assert.Equal(seriesId, result.Id);
            Assert.Equal("Test Series", result.Title);
            Assert.Equal("8.5", result.ImdbRating);
        }

        [Fact]
        public async Task GetSeriesByIdAsync_ThrowsSeriesNotFoundException_WhenSeriesDoesNotExist()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync((Series)null);

            // Act & Assert
            await Assert.ThrowsAsync<SeriesNotFoundException>(() => _seriesService.GetSeriesByIdAsync(seriesId));
        }

        [Fact]
        public async Task AddSeriesAsync_ReturnsSeriesDTO_WithCoverImage_WhenCoverImageProvided()
        {
            // Arrange
            var seriesDto = new SeriesDTO
            {
                Title = "New Series",
                Genre = "Action",
                ReleaseYear = 2021,
                FinalYear = null,
                Description = "New series description"
            };

            var content = "content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content)); // in-memory stream 
            IFormFile coverImage = new FormFile(stream, 0, stream.Length, "coverImage", "cover.jpg");

            _fileServiceMock.Setup(fs => fs.SaveFileAsync(coverImage)).ReturnsAsync("saved_cover.jpg"); // not real file-system call
            _seriesRepositoryMock.Setup(r => r.AddSeriesAsync(It.IsAny<Series>())).ReturnsAsync((Series s) => s); //return with series object

            // Act
            var result = await _seriesService.AddSeriesAsync(seriesDto, coverImage);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Series", result.Title);
            Assert.Equal("saved_cover.jpg", result.CoverImagePath);
        }

        [Fact]
        public async Task AddSeriesAsync_ReturnsSeriesDTO_WithDefaultCoverImage_WhenCoverImageNotProvided()
        {
            // Arrange
            var seriesDto = new SeriesDTO
            {
                Title = "New Series",
                Genre = "Action",
                ReleaseYear = 2021,
                FinalYear = null,
                Description = "New series description"
            };

            IFormFile coverImage = null;

            _seriesRepositoryMock.Setup(r => r.AddSeriesAsync(It.IsAny<Series>())).ReturnsAsync((Series s) => s);

            // Act
            var result = await _seriesService.AddSeriesAsync(seriesDto, coverImage);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Series", result.Title);
            Assert.Equal("covernotfound.jpg", result.CoverImagePath);
        }


        [Fact]
        public async Task UpdateSeriesAsync_ReturnsUpdatedSeriesDTO_WhenSeriesExists()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var existingSeries = new Series
            {
                Id = seriesId,
                Title = "Old Title",
                Genre = "Action",
                ReleaseYear = 2020,
                FinalYear = null,
                Description = "Old description",
                CoverImagePath = "old_cover.jpg"
            };

            var seriesDto = new SeriesDTO
            {
                Id = seriesId,
                Title = "Updated Title",
                Genre = "Thriller",
                ReleaseYear = 2021,
                FinalYear = null,
                Description = "Updated description"
            };

            var content = "new cover content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            IFormFile newCoverImage = new FormFile(stream, 0, stream.Length, "coverImage", "new_cover.jpg");

            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync(existingSeries);
            _fileServiceMock.Setup(fs => fs.DeleteFileAsync(existingSeries.CoverImagePath)).Returns(Task.CompletedTask);
            _fileServiceMock.Setup(fs => fs.SaveFileAsync(newCoverImage)).ReturnsAsync("new_saved_cover.jpg");
            _seriesRepositoryMock.Setup(r => r.UpdateSeriesAsync(It.IsAny<Series>())).ReturnsAsync((Series s) => s);

            // Act
            var result = await _seriesService.UpdateSeriesAsync(seriesId, seriesDto, newCoverImage);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);
            Assert.Equal("new_saved_cover.jpg", result.CoverImagePath);
        }


        [Fact]
        public async Task UpdateSeriesAsync_ThrowsSeriesNotFoundException_WhenSeriesDoesNotExist()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var seriesDto = new SeriesDTO
            {
                Id = seriesId,
                Title = "Updated Title",
                Genre = "Thriller",
                ReleaseYear = 2021,
                FinalYear = null,
                Description = "Updated description"
            };

            IFormFile newCoverImage = null;
            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync((Series)null);

            // Act & Assert
            await Assert.ThrowsAsync<SeriesNotFoundException>(() => _seriesService.UpdateSeriesAsync(seriesId, seriesDto, newCoverImage));
        }


        [Fact]
        public async Task DeleteSeriesAsync_ReturnsTrue_WhenDeletionIsSuccessful()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "Test Series"
            };

            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync(series);
            _seriesRepositoryMock.Setup(r => r.DeleteSeriesAsync(series)).ReturnsAsync(true);

            // Act
            var result = await _seriesService.DeleteSeriesAsync(seriesId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task DeleteSeriesAsync_ThrowsSeriesNotFoundException_WhenSeriesDoesNotExist()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            _seriesRepositoryMock.Setup(r => r.GetSeriesByIdAsync(seriesId)).ReturnsAsync((Series)null);

            // Act & Assert
            await Assert.ThrowsAsync<SeriesNotFoundException>(() => _seriesService.DeleteSeriesAsync(seriesId));
        }


        [Fact]
        public async Task GetEp1EpisodeIdAsync_ReturnsEpisodeIdDTO_WhenEpisodeExists()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "Test Series",
                Seasons = new List<Season>
                {
                    new Season
                    {
                        SeasonNumber = 1,
                        ReleaseYear = 2020, 
                        Episodes = new List<Episode>
                        {
                            new Episode { Id = Guid.NewGuid(), Title = "Some Episode" },
                            new Episode { Id = Guid.NewGuid(), Title = "EP1 - Pilot" }
                        }
                    }
                }
            };

            _seriesRepositoryMock.Setup(r => r.GetSeriesWithSeasonsAndEpisodesByIdAsync(seriesId)).ReturnsAsync(series);

            // Act
            var result = await _seriesService.GetEp1EpisodeIdAsync(seriesId);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<EpisodeIdDTO>(result);
        }

        [Fact]
        public async Task GetEp1EpisodeIdAsync_ThrowsSeriesNotFoundException_WhenSeriesDoesNotExist()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            _seriesRepositoryMock.Setup(r => r.GetSeriesWithSeasonsAndEpisodesByIdAsync(seriesId)).ReturnsAsync((Series)null);

            // Act & Assert
            await Assert.ThrowsAsync<SeriesNotFoundException>(() => _seriesService.GetEp1EpisodeIdAsync(seriesId));
        }
    }
}
