using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using evoWatch.Controllers;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Services;

namespace movieDirectoryBackend.Test
{
    public class SeriesControllerTests
    {
        private readonly Mock<ISeriesService> _seriesServiceMock;
        private readonly SeriesController _controller;

        public SeriesControllerTests()
        {
            // Initialize the mocked ISeriesService to isolate tests from external dependencies.
            _seriesServiceMock = new Mock<ISeriesService>();
            // Create an instance of the controller using the mocked service.
            _controller = new SeriesController(_seriesServiceMock.Object);
        }

        [Fact]
        public async Task GetSeries_ReturnsOk_WithSeriesList()
        {
            // Arrange: Prepare test data - a list of series. ( GET VARIALES, CLSASSES ETC. ) 
            var expectedSeries = new List<SeriesDTO>
            {
                new SeriesDTO { Id = Guid.NewGuid(), Title = "First Series" },
                new SeriesDTO { Id = Guid.NewGuid(), Title = "Second Series" }
            };
            // Setup the mocked service to return the expected series list.
            _seriesServiceMock.Setup(service => service.GetSeriesAsync()).ReturnsAsync(expectedSeries);

            // Act: Invoke the GetSeries method on the controller. ( EXECUTE THE FUNCTION )
            var result = await _controller.GetSeries();

            // Assert: Verify that the response is Ok and contains the expected series list.
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedSeries, okResult.Value);
        }

        [Fact]
        public async Task GetSeriesById_ReturnsOk_WithSeriesDTO_WhenFound()
        {
            // Arrange: Prepare test data - a series with a specific ID.
            var seriesId = Guid.NewGuid();
            var expectedSeries = new SeriesDTO { Id = seriesId, Title = "Test Series" };

            // Setup the mocked service to return the expected series for the given ID.
            _seriesServiceMock.Setup(service => service.GetSeriesByIdAsync(seriesId)).ReturnsAsync(expectedSeries);

            // Act: Invoke the GetSeriesById method with the test series ID.
            var result = await _controller.GetSeriesById(seriesId);

            // Assert: Verify that the response is Ok and contains the expected series data.
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedSeries, okResult.Value);
        }

        [Fact]
        public async Task GetSeriesById_ReturnsProblem_WhenSeriesNotFound()
        {
            // Arrange: Prepare a series ID that does not exist.
            var seriesId = Guid.NewGuid();

            // Setup the mocked service to throw a SeriesNotFoundException for the given ID.
            _seriesServiceMock.Setup(service => service.GetSeriesByIdAsync(seriesId)).ThrowsAsync(new SeriesNotFoundException());

            // Act: Invoke the GetSeriesById method expecting a failure.
            var result = await _controller.GetSeriesById(seriesId);

            // Assert: Verify that the response is a problem result with a 404 Not Found status code.
            var problemResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, problemResult.StatusCode);
        }

        [Fact]
        public async Task AddSeries_ReturnsOk_WithCreatedSeries()
        {
            // Arrange: Prepare test data - a new series to be added.
            var newSeries = new SeriesDTO { Id = Guid.NewGuid(), Title = "New Series" };
            // Simulate an IFormFile using an in-memory stream.
            var content = "dummy file content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            IFormFile formFile = new FormFile(stream, 0, stream.Length, "coverImage", "cover.jpg");

            // Setup the mocked service to return the newly added series.
            _seriesServiceMock.Setup(service => service.AddSeriesAsync(newSeries, formFile))
                .ReturnsAsync(newSeries);

            // Act: Invoke the AddSeries method with the new series and simulated file.
            var result = await _controller.AddSeries(newSeries, formFile);

            // Assert: Verify that the response is Ok and contains the created series.
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(newSeries, okResult.Value);
        }

        [Fact]
        public async Task UpdateSeries_ReturnsOk_WithUpdatedSeries_WhenFound()
        {
            // Arrange: Prepare test data for updating a series, including an IFormFile simulation.
            var seriesId = Guid.NewGuid();
            var seriesToUpdate = new SeriesDTO { Id = seriesId, Title = "Old Series Title" };
            var updatedSeries = new SeriesDTO { Id = seriesId, Title = "Updated Series Title" };

            // Simulate an IFormFile using an in-memory stream.
            var content = "dummy update file content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            IFormFile formFile = new FormFile(stream, 0, stream.Length, "coverImage", "updated_cover.jpg");

            // Setup the mocked service to return the updated series.
            _seriesServiceMock.Setup(service => service.UpdateSeriesAsync(seriesId, seriesToUpdate, formFile)).ReturnsAsync(updatedSeries);

            // Act: Invoke the UpdateSeries method on the controller.
            var result = await _controller.UpdateSeries(seriesId, seriesToUpdate, formFile);

            // Assert: Verify that the response is Ok and contains the updated series data.
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(updatedSeries, okResult.Value);
        }

        [Fact]
        public async Task UpdateSeries_ReturnsProblem_WhenSeriesNotFound()
        {
            // Arrange: Prepare test data for a non-existent series update.
            var seriesId = Guid.NewGuid();
            var seriesToUpdate = new SeriesDTO { Id = seriesId, Title = "Non-existent Series" };

            // Simulate an IFormFile using an in-memory stream.
            var content = "dummy file content";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            IFormFile formFile = new FormFile(stream, 0, stream.Length, "coverImage", "cover.jpg");

            // Setup the mocked service to throw a SeriesNotFoundException for the given update request.
            _seriesServiceMock.Setup(service => service.UpdateSeriesAsync(seriesId, seriesToUpdate, formFile)).ThrowsAsync(new SeriesNotFoundException());

            // Act: Invoke the UpdateSeries method expecting a failure.
            var result = await _controller.UpdateSeries(seriesId, seriesToUpdate, formFile);

            // Assert: Verify that the response is a problem result with a 404 Not Found status code.
            var problemResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, problemResult.StatusCode);
        }

        [Fact]
        public async Task DeleteSeriesAsync_ReturnsOk_WhenDeletionSuccessful()
        {
            // Arrange: Prepare a valid series ID for deletion.
            var seriesId = Guid.NewGuid();

            // Setup the mocked service to return true, indicating successful deletion.
            _seriesServiceMock.Setup(service => service.DeleteSeriesAsync(seriesId)).ReturnsAsync(true);

            // Act: Invoke the DeleteSeriesAsync method on the controller.
            var result = await _controller.DeleteSeriesAsync(seriesId);

            // Assert: Verify that the response is Ok.
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task DeleteSeriesAsync_ReturnsProblem_WhenDeletionFails()
        {
            // Arrange: Prepare a valid series ID for deletion.
            var seriesId = Guid.NewGuid();

            // Setup the mocked service to return false, indicating deletion failure.
            _seriesServiceMock.Setup(service => service.DeleteSeriesAsync(seriesId)).ReturnsAsync(false);

            // Act: Invoke the DeleteSeriesAsync method on the controller.
            var result = await _controller.DeleteSeriesAsync(seriesId);

            // Assert: Verify that the response is a problem result with a 500 Internal Server Error status code.
            var problemResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, problemResult.StatusCode);
        }

        [Fact]
        public async Task DeleteSeriesAsync_ReturnsProblem_WhenSeriesNotFound()
        {
            // Arrange: Prepare a series ID that does not exist.
            var seriesId = Guid.NewGuid();

            // Setup the mocked service to throw a SeriesNotFoundException for the deletion request.
            _seriesServiceMock.Setup(service => service.DeleteSeriesAsync(seriesId)).ThrowsAsync(new SeriesNotFoundException());

            // Act: Invoke the DeleteSeriesAsync method expecting a failure.
            var result = await _controller.DeleteSeriesAsync(seriesId);

            // Assert: Verify that the response is a problem result with a 404 Not Found status code.
            var problemResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status404NotFound, problemResult.StatusCode);
        }
    }
}
