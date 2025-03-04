using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace evoWatch.Services.Implementations
{
    public class EpisodeService : IEpisodeService
    {
        private readonly IEpisodesRepository _episodesRepository;
        private readonly ISeasonsRepository _seasonRepository;
        private readonly IFileSystemService _fileService;
        private readonly IWebHostEnvironment _env;
        private readonly IVideoStorageService _videoStorageService;
        private readonly IPeopleRepository _peopleRepository;


        public EpisodeService(
            IEpisodesRepository episodesRepository,
            ISeasonsRepository seasonRepository,
            IFileSystemService fileService,
            IWebHostEnvironment env,
            IConfiguration configuration,
            IVideoStorageService videoStorageService,
            IPeopleRepository peopleRepository)
        {
            _episodesRepository = episodesRepository;
            _seasonRepository = seasonRepository;
            _fileService = fileService;
            _env = env;
            _videoStorageService = videoStorageService;
            _peopleRepository = peopleRepository;
        }

        public async Task<EpisodeDTO> GetEpisodeByIdAsync(Guid id)
        {
            var episode = await _episodesRepository.GetEpisodeByIdAsync(id);
            if (episode == null || episode.IsMovie) throw new EpisodeNotFoundException();
            return EpisodeDTO.CreateFromEpisodeDocument(episode);
        }

        public async Task<IEnumerable<EpisodeDTO>> GetEpisodesAsync(Guid seasonId)
        {
            var episodes = await _episodesRepository.GetEpisodesAsync();
            return episodes
                .Where(e => !e.IsMovie && e.Season != null && e.Season.Id == seasonId)
                .Select(e => EpisodeDTO.CreateFromEpisodeDocument(e));
        }

        public async Task<EpisodeDTO> AddEpisodeAsync(EpisodeDTO episodeDto, IFormFile? videoFile)
        {

            var season = await _seasonRepository.GetSeasonByIdAsync(episodeDto.SeasonId);
            if (season == null) throw new SeasonNotFoundException();

            if (videoFile != null && videoFile.Length > 0)
            {
                var savedVideoPath = await _videoStorageService.SaveVideoAsync(videoFile);
                episodeDto.VideoPath = savedVideoPath;
            }
            else
            {
                episodeDto.VideoPath = null;
            }

            var newEpisode = new Episode
            {
                Id = Guid.NewGuid(),
                Title = episodeDto.Title,
                VideoPath = episodeDto.VideoPath,
                IsMovie = false,
                Season = season,
                ProductionCompany = null,
                Person = new List<Person>(),
                Characters = new List<Character>()
            };

            var result = await _episodesRepository.AddEpisodeAsync(newEpisode);
            return EpisodeDTO.CreateFromEpisodeDocument(result);
        }

        public async Task<EpisodeDTO> UpdateEpisodeAsync(Guid id, EpisodeDTO episodeDto, IFormFile? newVideoFile)
        {
            var existingEpisode = await _episodesRepository.GetEpisodeByIdAsync(id);
            if (existingEpisode == null || existingEpisode.IsMovie) throw new EpisodeNotFoundException();

            // Csak akkor frissítjük az évadot, ha új SeasonId-t kapunk és az különbözik a jelenlegitől
            if (episodeDto.SeasonId != Guid.Empty && episodeDto.SeasonId != existingEpisode.Season.Id)
            {
                var season = await _seasonRepository.GetSeasonByIdAsync(episodeDto.SeasonId);
                if (season == null) throw new SeasonNotFoundException();
                existingEpisode.Season = season;
            }

            // Frissítjük a többi mezőt
            existingEpisode.Title = !string.IsNullOrEmpty(episodeDto.Title) ? episodeDto.Title : existingEpisode.Title;

            // Videófájl feltöltése, ha új fájl érkezett
            if (newVideoFile != null && newVideoFile.Length > 0)
            {
                existingEpisode.VideoPath = await _videoStorageService.SaveVideoAsync(newVideoFile);
            }

            var result = await _episodesRepository.UpdateEpisodeAsync(existingEpisode);
            return EpisodeDTO.CreateFromEpisodeDocument(result);
        }

        public async Task<bool> DeleteEpisodeAsync(Guid id)
        {
            var existingEpisode = await _episodesRepository.GetEpisodeByIdAsync(id);
            if (existingEpisode == null || existingEpisode.IsMovie) throw new EpisodeNotFoundException();
            return await _episodesRepository.DeleteEpisodeAsync(existingEpisode);
        }

        public async Task<EpisodeDTO> CreateAndAddPersonToEpisodeAsync(Guid episodeId, PersonDTO personDto)
        {
            // Új személy létrehozása a megadott adatokkal
            var newPerson = new Person
            {
                Id = Guid.NewGuid(), // Ideiglenesen generáljuk, az adatbázisba mentéskor ez lesz az új Id
                Name = personDto.Name,
                Age = personDto.Age,
                Role = personDto.Role,
                Awards = personDto.Awards,
                Gender = personDto.Gender,
                Episodes = new List<Episode>(),
                Characters = new List<Character>()
            };

            // Létrehozzuk a személyt az adatbázisban
            newPerson = await _peopleRepository.AddPersonAsync(newPerson);

            // Betöltjük az epizódot a kapcsolódó személyekkel együtt
            var episode = await _episodesRepository.GetEpisodeByIdWithPersonsAsync(episodeId);
            if (episode == null)
                throw new EpisodeNotFoundException();

            // Hozzáadjuk az új személyt az epizód navigációs gyűjteményéhez
            episode.Person.Add(newPerson);

            // Frissítjük az epizódot, így a sok‑sok kapcsolat is mentésre kerül
            var updatedEpisode = await _episodesRepository.UpdateEpisodeAsync(episode);

            return EpisodeDTO.CreateFromEpisodeDocument(updatedEpisode);
        }
    }
}
