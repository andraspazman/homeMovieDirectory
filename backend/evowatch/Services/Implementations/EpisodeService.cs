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
        private readonly IProductionCompanyRepository _productionCompanyRepository;


        public EpisodeService(
            IEpisodesRepository episodesRepository,
            ISeasonsRepository seasonRepository,
            IFileSystemService fileService,
            IWebHostEnvironment env,
            IConfiguration configuration,
            IVideoStorageService videoStorageService,
            IPeopleRepository peopleRepository,
            IProductionCompanyRepository productionCompanyRepository)
        {
            _episodesRepository = episodesRepository;
            _seasonRepository = seasonRepository;
            _fileService = fileService;
            _env = env;
            _videoStorageService = videoStorageService;
            _peopleRepository = peopleRepository;
            _productionCompanyRepository = productionCompanyRepository;
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
            return episodes.Where(e => !e.IsMovie && e.Season != null && e.Season.Id == seasonId).Select(e => EpisodeDTO.CreateFromEpisodeDocument(e));
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

            // Frissítjük a Season-t csak akkor, ha a DTO-ban szerepel nem üres SeasonId
            if (episodeDto.SeasonId != Guid.Empty)
            {
                // Ha a jelenlegi Season nincs beállítva, vagy az új SeasonId különbözik a jelenlegitől
                if (existingEpisode.Season == null || episodeDto.SeasonId != existingEpisode.Season.Id)
                {
                    var season = await _seasonRepository.GetSeasonByIdAsync(episodeDto.SeasonId);
                    if (season != null)
                    {
                        existingEpisode.Season = season;
                    }
                    else
                    {
                        Console.Error.WriteLine($"Season not found for SeasonId: {episodeDto.SeasonId}. Season update skipped.");                
                    }
                }
            }
            // Ha a SeasonId Guid.Empty, akkor feltételezzük, hogy nem kell módosítani a Season-t.

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

        public async Task<IEnumerable<PersonDTO>> GetPersonsByEpisodeIdAsync(Guid episodeId)
        {
            // Használjuk a repository egy metódusát, amely betölti a kapcsolódó személyeket is:
            var episode = await _episodesRepository.GetEpisodeByIdWithPersonsAsync(episodeId);
            if (episode == null)
                throw new EpisodeNotFoundException();

            // A kapcsolódó személyeket átalakítjuk PersonDTO-ká
            return episode.Person.Select(p => PersonDTO.CreateFromPerson(p)).ToList();
        }

        public async Task<EpisodeDTO> AddProductionCompanyToEpisodeAsync(Guid episodeId, ProductionCompanyDTO productionCompanyDto)
        {
            // Betöltjük az epizódot az adott azonosító alapján
            var episode = await _episodesRepository.GetEpisodeByIdAsync(episodeId);
            if (episode == null)
                throw new EpisodeNotFoundException();

            // Létrehozzuk a ProductionCompany entitást a DTO alapján.
            // Itt feltételezzük, hogy új production company-ról van szó, ezért új Id-t generálunk.
            var productionCompany = new ProductionCompany
            {
                Id = Guid.NewGuid(),
                Name = productionCompanyDto.Name,
                FoundationYear = productionCompanyDto.FoundationYear,
                Country = productionCompanyDto.Country,
                Website = productionCompanyDto.Website
            };

            // Felvesszük az adatbázisba az új filmgyártót
            productionCompany = await _productionCompanyRepository.AddProductionCompanyAsync(productionCompany);

            // Hozzárendeljük a filmgyártót az epizódhoz
            // Feltételezzük, hogy az Episode entitásban van ProductionCompany vagy ProductionCompanyId property
            episode.ProductionCompany = productionCompany;
            // Ha explicit külső kulcsot használsz, akkor:
            // episode.ProductionCompanyId = productionCompany.Id;

            // Frissítjük az epizódot az adatbázisban
            var updatedEpisode = await _episodesRepository.UpdateEpisodeAsync(episode);

            // Visszaadjuk a frissített epizód DTO-ját
            return EpisodeDTO.CreateFromEpisodeDocument(updatedEpisode);
        }


        public async Task<bool> DeleteProductionCompanyAsync(Guid id)
        {
            // Retrieve the production company
            var productionCompany = await _productionCompanyRepository.GetProductionCompanyByIdAsync(id);
            if (productionCompany == null)
            {
                throw new Exception("Production company not found.");
            }

            // Retrieve episodes that reference this production company
            var episodes = await _episodesRepository.GetEpisodesByProductionCompanyIdAsync(id);
            foreach (var episode in episodes)
            {
                // Remove the production company reference from the episode
                episode.ProductionCompany = null;
                // If using explicit foreign key, set it to null as well:
                // episode.ProductionCompanyId = null;
                await _episodesRepository.UpdateEpisodeAsync(episode);
            }

            // Now delete the production company
            return await _productionCompanyRepository.DeleteProductionCompanyAsync(productionCompany);
        }

        public async Task<ProductionCompanyDTO> GetProductionCompanyByEpisodeIdAsync(Guid episodeId)
        {
            // Retrieve the episode with its production company
            var episode = await _episodesRepository.GetEpisodeWithProductionCompanyAsync(episodeId);
            if (episode == null)
            {
                throw new EpisodeNotFoundException();
            }
            if (episode.ProductionCompany == null)
            {
                throw new Exception("No production company assigned to this episode.");
            }

            // Convert the production company entity to its DTO
            return ProductionCompanyDTO.CreateFromProductionCompanyDocument(episode.ProductionCompany);
        }

    }
}
