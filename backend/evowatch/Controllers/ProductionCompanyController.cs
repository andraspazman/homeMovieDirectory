using evoWatch.DTOs;
using evoWatch.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace evoWatch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionCompanyController : ControllerBase
    {
        private readonly IProductionCompanyService _productionCompanyService;

        public ProductionCompanyController(IProductionCompanyService productionCompanyService)
        {
            _productionCompanyService = productionCompanyService;
        }

        /// <summary>
        /// Retrieves a production company by its ID.
        /// </summary>
        /// <param name="id">The production company ID</param>
        /// <returns>A ProductionCompanyDTO</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductionCompanyById(Guid id)
        {
            try
            {
                var productionCompany = await _productionCompanyService.GetProductionCompanyByIdAsync(id);
                return Ok(productionCompany);
            }
            catch (Exception ex)
            {
                // Log error or handle specific exceptions as needed
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Updates an existing production company with the provided data.
        /// Only fields that are non-null and changed will be updated.
        /// </summary>
        /// <param name="id">The production company ID</param>
        /// <param name="productionCompanyDto">The DTO containing updated production company data</param>
        /// <returns>The updated ProductionCompanyDTO</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProductionCompany(Guid id, [FromBody] ProductionCompanyDTO productionCompanyDto)
        {
            if (productionCompanyDto == null)
            {
                return BadRequest("Production company data is required.");
            }

            try
            {
                var updatedCompany = await _productionCompanyService.UpdateProductionCompanyAsync(id, productionCompanyDto);
                return Ok(updatedCompany);
            }
            catch (Exception ex)
            {
                // Log error or handle specific exceptions as needed
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Deletes a production company by its ID.
        /// </summary>
        /// <param name="id">The production company ID</param>
        /// <returns>A message indicating the deletion status</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductionCompany(Guid id)
        {
            try
            {
                var result = await _productionCompanyService.DeleteProductionCompanyAsync(id);
                if (result)
                {
                    return Ok("Production company deleted successfully.");
                }
                return BadRequest("Failed to delete production company.");
            }
            catch (Exception ex)
            {
                // Log error or handle specific exceptions as needed
                return BadRequest(ex.Message);
            }
        }
    }
}
