using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using System;
using System.Threading.Tasks;

namespace evoWatch.Services.Implementations
{
    public class ProductionCompanyService : IProductionCompanyService
    {
        private readonly IProductionCompanyRepository _productionCompanyRepository;
        private readonly IEpisodesRepository _episodesRepository;

        public ProductionCompanyService(
            IProductionCompanyRepository productionCompanyRepository,
            IEpisodesRepository episodesRepository)
        {
            _productionCompanyRepository = productionCompanyRepository;
            _episodesRepository = episodesRepository;
        }

        /// <summary>
        /// Retrieves a production company by its ID and converts it to a DTO.
        /// </summary>
        /// <param name="id">The production company ID.</param>
        /// <returns>A ProductionCompanyDTO.</returns>
        public async Task<ProductionCompanyDTO> GetProductionCompanyByIdAsync(Guid id)
        {
            var productionCompany = await _productionCompanyRepository.GetProductionCompanyByIdAsync(id);
            if (productionCompany == null)
            {
                throw new Exception("Production company not found.");
            }
            return ProductionCompanyDTO.CreateFromProductionCompanyDocument(productionCompany);
        }

        /// <summary>
        /// Updates an existing production company.
        /// Only updates fields that are non-null (and modified) in the provided DTO.
        /// </summary>
        /// <param name="id">The production company ID.</param>
        /// <param name="productionCompanyDto">The DTO containing updated data.</param>
        /// <returns>The updated ProductionCompanyDTO.</returns>
        public async Task<ProductionCompanyDTO> UpdateProductionCompanyAsync(Guid id, ProductionCompanyDTO productionCompanyDto)
        {
            // Retrieve the existing production company
            var existingProductionCompany = await _productionCompanyRepository.GetProductionCompanyByIdAsync(id);
            if (existingProductionCompany == null)
            {
                throw new Exception("Production company not found.");
            }

            // Update only fields that are provided (non-null) and modified
            // For the Name field - assuming it is required; update if not null or empty
            if (!string.IsNullOrEmpty(productionCompanyDto.Name) && productionCompanyDto.Name != existingProductionCompany.Name)
            {
                existingProductionCompany.Name = productionCompanyDto.Name;
            }

            // Update FoundationYear if provided
            if (productionCompanyDto.FoundationYear.HasValue && productionCompanyDto.FoundationYear != existingProductionCompany.FoundationYear)
            {
                existingProductionCompany.FoundationYear = productionCompanyDto.FoundationYear;
            }

            // Update Country if provided
            if (!string.IsNullOrEmpty(productionCompanyDto.Country) && productionCompanyDto.Country != existingProductionCompany.Country)
            {
                existingProductionCompany.Country = productionCompanyDto.Country;
            }

            // Update Website if provided
            if (!string.IsNullOrEmpty(productionCompanyDto.Website) && productionCompanyDto.Website != existingProductionCompany.Website)
            {
                existingProductionCompany.Website = productionCompanyDto.Website;
            }

            // Update the production company in the repository
            var updatedProductionCompany = await _productionCompanyRepository.UpdateProductionCompanyAsync(existingProductionCompany);
            return ProductionCompanyDTO.CreateFromProductionCompanyDocument(updatedProductionCompany);
        }

        /// <summary>
        /// Deletes a production company by its ID.
        /// Before deletion, removes the production company reference from all episodes referencing it.
        /// </summary>
        /// <param name="id">The production company ID</param>
        /// <returns>A boolean indicating whether the deletion was successful.</returns>
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
    }
}
