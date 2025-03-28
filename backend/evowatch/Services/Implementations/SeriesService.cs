﻿using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace evoWatch.Services.Implementations
{
    public class SeriesService : ISeriesService
    {
        private readonly ISeriesRepository _seriesRepository;
        private readonly ISeasonsRepository _seasonsRepository;
        private readonly IEpisodesRepository _episodesRepository;
        private readonly IMovieService _movieService;
        private readonly IWebHostEnvironment _env;
        private readonly IFileSystemService _fileService;

        public SeriesService(  
            ISeriesRepository seriesRepository,
            IMovieService movieService, 
            IWebHostEnvironment env, 
            IFileSystemService fileService, 
            ISeasonsRepository seasonsRepository,
            IEpisodesRepository _episodesRepository
            )

        {
            _seriesRepository = seriesRepository;
            _seasonsRepository = seasonsRepository;
            _movieService = movieService;
            _env = env;
            _fileService = fileService;
        }

        public async Task<SeriesDTO> GetSeriesByIdAsync(Guid id)
        {
            var series = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return SeriesDTO.CreateFromSeriesDocument(series);
        }

        public async Task<SeriesDTO> AddSeriesAsync(SeriesDTO series, IFormFile? coverImage)
        {
            var newSeries = new Series()
            {
                Id = Guid.NewGuid(),
                Title = series.Title,
                Genre = series.Genre,
                ReleaseYear = series.ReleaseYear,
                FinalYear = series.FinalYear,
                Description = series.Description
            };

           
            if (coverImage != null && coverImage.Length > 0)
            {
                newSeries.CoverImagePath = await _fileService.SaveFileAsync(coverImage);
            }
            else
            {
                newSeries.CoverImagePath = "covernotfound.jpg";
            }

            var result = await _seriesRepository.AddSeriesAsync(newSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);
        }


        public async Task<IEnumerable<SeriesDTO>> GetSeriesAsync()
        {
            var result = await _seriesRepository.GetSeriesAsync();
            return result.Select(x => SeriesDTO.CreateFromSeriesDocument(x));
        }

        public async Task<SeriesDTO> UpdateSeriesAsync(Guid id, SeriesDTO series, IFormFile? coverImage)
        {
            var existingSeries = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();

            existingSeries.Title = series.Title;
            existingSeries.Genre = series.Genre;
            existingSeries.ReleaseYear = series.ReleaseYear;
            existingSeries.FinalYear = series.FinalYear;
            existingSeries.Description = series.Description;

            if (coverImage != null && coverImage.Length > 0)
            {
                // Delete previous picture
                existingSeries.CoverImagePath = await _fileService.SaveFileAsync(coverImage);
            }

            var result = await _seriesRepository.UpdateSeriesAsync(existingSeries);
            return SeriesDTO.CreateFromSeriesDocument(result);
        }

        public async Task<bool> DeleteSeriesAsync(Guid id)
        {
            var seriesDelete = await _seriesRepository.GetSeriesByIdAsync(id) ?? throw new SeriesNotFoundException();
            return await _seriesRepository.DeleteSeriesAsync(seriesDelete);
        }

        public async Task<EpisodeIdDTO> GetEp1EpisodeIdAsync(Guid seriesId)
        {
            
            var series = await _seriesRepository.GetSeriesWithSeasonsAndEpisodesByIdAsync(seriesId);
            if (series == null)
                throw new SeriesNotFoundException();

            
            var season = series.Seasons.FirstOrDefault(s => s.SeasonNumber == 1);
            if (season == null)
                throw new SeasonNotFoundException();

            
            var ep1Episode = season.Episodes
                .FirstOrDefault(e => e.Title.Trim().IndexOf("EP1", StringComparison.OrdinalIgnoreCase) >= 0);

            if (ep1Episode == null)
                throw new EpisodeNotFoundException();

            return new EpisodeIdDTO { EpisodeId = ep1Episode.Id };
        }

    }
}
