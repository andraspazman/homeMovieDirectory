using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using evoWatch.Database;
using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.Database.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace evoWatch.Tests.Repositories
{
    public class SeriesRepositoryTests
    {
        private readonly DatabaseContext _dbContext;
        private readonly ISeriesRepository _seriesRepository;

        public SeriesRepositoryTests()
        {
            // In-memory DB
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}").Options;


            _dbContext = new DatabaseContext(options);
            _seriesRepository = new SeriesRepository(_dbContext);
        }

        [Fact]
        public async Task AddSeriesAsync_Should_Add_And_Return_Entity()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "Test Series",
                Genre = "Drama"
            };

            // Act
            var addedSeries = await _seriesRepository.AddSeriesAsync(series);

            // Assert
            Assert.NotNull(addedSeries);
            Assert.Equal(seriesId, addedSeries.Id);
            Assert.Equal("Test Series", addedSeries.Title);


            var fromDb = await _dbContext.Series.FindAsync(seriesId); // check this saved in db
            Assert.NotNull(fromDb);
            Assert.Equal("Test Series", fromDb.Title);
        }

        [Fact]
        public async Task GetSeriesAsync_Should_Return_All_Series()
        {
            // Arrange
            var series1 = new Series
            {
                Id = Guid.NewGuid(),
                Title = "Series 1",
                Genre = "Comedy"
            };
            var series2 = new Series
            {
                Id = Guid.NewGuid(),
                Title = "Series 2",
                Genre = "Thriller"
            };

            await _dbContext.Series.AddAsync(series1);
            await _dbContext.Series.AddAsync(series2);
            await _dbContext.SaveChangesAsync();

            // Act
            var allSeries = await _seriesRepository.GetSeriesAsync();

            // Assert
            Assert.NotNull(allSeries);
            var list = allSeries.ToList();
            Assert.Equal(2, list.Count);

            Assert.Contains(list, s => s.Title == "Series 1");
            Assert.Contains(list, s => s.Title == "Series 2");
        }

        [Fact]
        public async Task GetSeriesByIdAsync_Should_Return_Correct_Entity()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "Existing Series",
                Genre = "Action"
            };
            _dbContext.Series.Add(series);
            await _dbContext.SaveChangesAsync();

            // Act
            var found = await _seriesRepository.GetSeriesByIdAsync(seriesId);

            // Assert
            Assert.NotNull(found);
            Assert.Equal("Existing Series", found.Title);
        }

        [Fact]
        public async Task GetSeriesByIdAsync_Should_Return_Null_If_Not_Found()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var found = await _seriesRepository.GetSeriesByIdAsync(nonExistentId);

            // Assert
            Assert.Null(found);
        }

        [Fact]
        public async Task UpdateSeriesAsync_Should_Update_Entity()
        {
            // Arrange
            var series = new Series
            {
                Id = Guid.NewGuid(),
                Title = "Old Title",
                Genre = "Horror"
            };
            _dbContext.Series.Add(series);
            await _dbContext.SaveChangesAsync();

            
            series.Title = "Updated Title"; // Modify title

            // Act
            var updatedSeries = await _seriesRepository.UpdateSeriesAsync(series);

            // Assert
            Assert.NotNull(updatedSeries);
            Assert.Equal("Updated Title", updatedSeries.Title);

           
            var fromDb = await _dbContext.Series.FindAsync(series.Id);  // chech to updated in db
            Assert.NotNull(fromDb);
            Assert.Equal("Updated Title", fromDb.Title);
        }

        [Fact]
        public async Task DeleteSeriesAsync_Should_Remove_Entity_And_Return_True()
        {
            // Arrange
            var series = new Series
            {
                Id = Guid.NewGuid(),
                Title = "To be deleted",
                Genre = "Sci-Fi"
            };
            _dbContext.Series.Add(series);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _seriesRepository.DeleteSeriesAsync(series);

            // Assert
            Assert.True(result);


            var fromDb = await _dbContext.Series.FindAsync(series.Id); // Check to deleted it from db
            Assert.Null(fromDb);
        }

        [Fact]
        public async Task GetSeriesWithSeasonsAndEpisodesByIdAsync_Should_Include_Seasons_And_Episodes()
        {
            // Arrange
            var seriesId = Guid.NewGuid();
            var series = new Series
            {
                Id = seriesId,
                Title = "Series with Seasons",
                Genre = "Fantasy",
                Seasons = new List<Season>
                {
                    new Season
                    {
                        Id = Guid.NewGuid(),
                        SeasonNumber = 1,
                        ReleaseYear = 2023,
                        Episodes = new List<Episode>
                        {
                            new Episode { Id = Guid.NewGuid(), Title = "Episode 1" },
                            new Episode { Id = Guid.NewGuid(), Title = "Episode 2" }
                        }
                    },
                    new Season
                    {
                        Id = Guid.NewGuid(),
                        SeasonNumber = 2,
                        ReleaseYear = 2024, 
                        Episodes = new List<Episode>
                        {
                            new Episode { Id = Guid.NewGuid(), Title = "Episode 1" }
                        }
                    }
                }
            };

            _dbContext.Series.Add(series);
            await _dbContext.SaveChangesAsync();

            // Act
            var found = await _seriesRepository.GetSeriesWithSeasonsAndEpisodesByIdAsync(seriesId);

            // Assert
            Assert.NotNull(found);
            Assert.Equal(seriesId, found.Id);
            Assert.NotNull(found.Seasons);
            Assert.Equal(2, found.Seasons.Count);

            var firstSeason = found.Seasons.First();
            Assert.NotNull(firstSeason.Episodes);
            Assert.Equal(2, firstSeason.Episodes.Count);
        }
    }
}
