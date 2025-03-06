using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface IProductionCompanyService
    {

        Task<ProductionCompanyDTO> GetProductionCompanyByIdAsync(Guid id);
        Task<ProductionCompanyDTO> UpdateProductionCompanyAsync(Guid id, ProductionCompanyDTO productionCompanyDto);
        Task<bool> DeleteProductionCompanyAsync(Guid id);
    }
}
